"""
Main analysis orchestration service.

Coordinates:
  1. Text extraction (from file_path or direct text_content)
  2. Plagiarism/similarity analysis against corpus
  3. AI-generated content detection
  4. Result persistence in MongoDB
  5. Returns structured AnalysisResponse
"""

import json
import uuid
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.models.analysis_model import AnalysisDocument, AnalysisStatus, SimilarityFinding
from app.schemas.analysis_schema import AnalysisRequest, AnalysisResponse, AnalysisStatus as SchemaStatus
from app.services.plagiarism_service import compute_similarity
from app.services.ai_detection_service import compute_ai_score, compute_sentence_level_breakdown
from app.utils.text_extractor import extract_text
from app.utils.text_normalizer import normalize

COLLECTION = "analyses"
_IN_MEMORY_DOCS: dict[str, dict] = {}


class AnalysisService:

    def __init__(self, db: AsyncIOMotorDatabase | None):
        self.db = db
        self.col = db[COLLECTION] if db is not None else None

    # ----------------------------------------------------------------
    # CREATE — trigger new analysis
    # ----------------------------------------------------------------

    async def analyse(self, request: AnalysisRequest) -> AnalysisResponse:
        """
        Full analysis pipeline:
          1. Extract text from content or file
          2. Compare against corpus (plagiarism)
          3. Score for AI-generated content
          4. Persist and return result
        """
        analysis_id = str(uuid.uuid4())

        # --- Persist with PROCESSING status immediately ---
        doc = AnalysisDocument(
            analysis_id=analysis_id,
            submission_id=request.submission_id,
            student_id=request.student_id,
            assignment_id=request.assignment_id,
            status=AnalysisStatus.PROCESSING,
            created_at=datetime.now(timezone.utc),
        )
        doc_dict = doc.model_dump(by_alias=False, exclude={"id"})
        _IN_MEMORY_DOCS[analysis_id] = doc_dict

        if self.col is not None:
            try:
                await self.col.insert_one(doc_dict)
            except Exception as e:
                print(f"[AnalysisService] Mongo insert failed ({e}); using memory store.")

        try:
            # --- Step 1: Extract text ---
            text = request.text_content or ""
            if not text and request.file_path:
                if request.file_path.startswith("s3://"):
                    try:
                        import boto3
                        import tempfile
                        import os
                        s3_path = request.file_path[5:]
                        bucket_name, key_name = s3_path.split("/", 1)
                        s3_cli = boto3.client(
                            's3',
                            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                            region_name=os.getenv('AWS_REGION', 'eu-north-1')
                        )
                        suffix = "." + key_name.split(".")[-1] if "." in key_name else ".docx"
                        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_f:
                            s3_cli.download_fileobj(bucket_name, key_name, tmp_f)
                            tmp_name = tmp_f.name
                        try:
                            text = extract_text(tmp_name)
                        finally:
                            try:
                                os.remove(tmp_name)
                            except Exception:
                                pass
                    except Exception as s3_err:
                        print(f"[AnalysisService] S3 download error: {s3_err}, trying direct extraction")
                        text = extract_text(request.file_path)
                else:
                    text = extract_text(request.file_path)

            if not text or len(text.strip()) < 5:
                raise ValueError(
                    "No extractable text found in document. Please ensure the uploaded file contains selectable text rather than image-only scans."
                )

            normalized_text = normalize(text)

            # --- Step 2: Plagiarism — build corpus per-assignment (excluding same student) ---
            corpus = await self._build_corpus(
                exclude_submission_id=request.submission_id,
                exclude_student_id=request.student_id,
                assignment_id=request.assignment_id,
            )
            similarity_result = compute_similarity(
                normalized_text,
                corpus,
                exclude_student_id=request.student_id,
                exclude_submission_id=request.submission_id,
            )

            # --- Step 3: AI detection ---
            ai_result = compute_ai_score(text)

            similarity_score: float = similarity_result["similarity_score"]
            ai_generated_score: float = ai_result["ai_generated_score"]

            # Compute sentence level breakdown for Turnitin-style yellow highlights
            sentence_breakdown = compute_sentence_level_breakdown(
                text=text,
                corpus=corpus,
                overall_ai_score=ai_generated_score
            )

            # Harmonize overall AI score with sentence-level breakdown
            ai_flagged_sentences = [s for s in sentence_breakdown if s.get("is_ai")]
            if ai_flagged_sentences and len(sentence_breakdown) > 0:
                ai_sentence_ratio = len(ai_flagged_sentences) / len(sentence_breakdown)
                derived_ai_score = round(ai_sentence_ratio * 100.0, 1)
                if derived_ai_score > ai_generated_score:
                    ai_generated_score = max(ai_generated_score, derived_ai_score, min(95.0, 60.0 + (len(ai_flagged_sentences) * 8.0)))
                    ai_result["ai_generated_score"] = ai_generated_score

            # --- Detect Peer Match / Plagiarism within the same assignment ---
            has_peer_collusion = False
            top_peer_score = 0.0
            sim_findings_raw = similarity_result.get("findings", [])
            for f in sim_findings_raw:
                f_score = float(f.get("similarity_score", 0.0))
                if f_score >= 60.0:
                    has_peer_collusion = True
                    top_peer_score = max(top_peer_score, f_score)

            if has_peer_collusion:
                # If another student in the same assignment submitted the same or near-identical document
                similarity_score = max(similarity_score, top_peer_score)
                is_plagiarism_flagged = True
            else:
                is_plagiarism_flagged = similarity_score >= (settings.similarity_threshold * 100)

            is_ai_flagged = ai_generated_score >= (settings.ai_detection_threshold * 100)

            text_similarity_pct = round(float(similarity_score), 2)
            ai_probability_pct = round(float(ai_generated_score), 2)
            code_similarity_pct = round(float(similarity_result.get("code_similarity_score", similarity_score)), 2)

            max_score = max(text_similarity_pct, ai_probability_pct, code_similarity_pct)
            if max_score >= 60.0 or has_peer_collusion:
                risk_score = "High"
            elif max_score >= 30.0:
                risk_score = "Medium"
            else:
                risk_score = "Low"

            # --- Build findings list ---
            findings: list[str] = []
            if has_peer_collusion or similarity_score >= 65.0:
                findings.append(
                    f"Direct peer match detected with another student's submission in this assignment ({similarity_score:.1f}% similarity). "
                    f"The submitted documents appear to be the same or heavily copied (Peer Plagiarism / Collusion detected)."
                )
            elif is_plagiarism_flagged:
                findings.append(
                    f"Similarity score {similarity_score:.1f}% exceeds threshold "
                    f"({settings.similarity_threshold * 100:.0f}%) — potential plagiarism detected."
                )

            if is_ai_flagged:
                findings.append(
                    f"AI-generated content score {ai_generated_score:.1f}% exceeds threshold "
                    f"({settings.ai_detection_threshold * 100:.0f}%). {ai_result['interpretation']}"
                )
            if not findings:
                findings.append("No significant integrity concerns detected.")

            # --- Build summary ---
            if has_peer_collusion or similarity_score >= 65.0:
                summary = (
                    f"CRITICAL RISK: Direct match detected with another student's submission in this assignment ({similarity_score:.1f}% similarity). "
                    f"The documents seem to be the same. "
                    f"AI-generated: {ai_generated_score:.1f}% ({'FLAGGED' if is_ai_flagged else 'OK'}). "
                    f"Immediate review recommended."
                )
            else:
                summary = (
                    f"Risk Level: {risk_score}. "
                    f"Similarity: {similarity_score:.1f}% "
                    f"({'FLAGGED' if is_plagiarism_flagged else 'OK'}). "
                    f"AI-generated: {ai_generated_score:.1f}% "
                    f"({'FLAGGED' if is_ai_flagged else 'OK'}). "
                    f"{'Manual review recommended.' if (is_plagiarism_flagged or is_ai_flagged) else 'No issues found.'}"
                )

            # --- Build similarity findings ---
            sim_findings = [
                SimilarityFinding(
                    matched_submission_id=f["matched_submission_id"],
                    similarity_score=f["similarity_score"],
                    matched_segments=f.get("matched_segments", []),
                )
                for f in similarity_result.get("findings", [])
            ]

            raw_result = json.dumps({
                "similarity_details": similarity_result,
                "ai_detection_details": ai_result,
                "sentence_breakdown": sentence_breakdown,
                "extracted_text": text,
                "risk_score": risk_score,
                "text_similarity_pct": text_similarity_pct,
                "ai_probability_pct": ai_probability_pct,
                "code_similarity_pct": code_similarity_pct,
            })

            completed_at = datetime.now(timezone.utc)

            # --- Update MongoDB document ---
            update = {
                "$set": {
                    "status": AnalysisStatus.COMPLETED,
                    "student_id": request.student_id,
                    "assignment_id": request.assignment_id,
                    "similarity_score": similarity_score,
                    "ai_generated_score": ai_generated_score,
                    "text_similarity_pct": text_similarity_pct,
                    "ai_probability_pct": ai_probability_pct,
                    "code_similarity_pct": code_similarity_pct,
                    "risk_score": risk_score,
                    "is_plagiarism_flagged": is_plagiarism_flagged,
                    "is_ai_generated_flagged": is_ai_flagged,
                    "similarity_findings": [sf.model_dump() for sf in sim_findings],
                    "linguistic_features": ai_result.get("features", {}),
                    "findings": findings,
                    "summary": summary,
                    "raw_result": raw_result,
                    "completed_at": completed_at,
                    # Store normalized text for future corpus comparisons
                    "normalized_text": normalized_text,
                    "extracted_text": text,
                }
            }
            if analysis_id in _IN_MEMORY_DOCS:
                _IN_MEMORY_DOCS[analysis_id].update(update["$set"])
            else:
                _IN_MEMORY_DOCS[analysis_id] = update["$set"]

            if self.col is not None:
                try:
                    await self.col.update_one({"analysis_id": analysis_id}, update)
                except Exception as e:
                    print(f"[AnalysisService] Mongo update failed ({e}); saved in memory.")

            return AnalysisResponse(
                analysis_id=analysis_id,
                submission_id=request.submission_id,
                status=SchemaStatus.COMPLETED,
                similarity_score=similarity_score,
                ai_generated_score=ai_generated_score,
                text_similarity_pct=text_similarity_pct,
                ai_probability_pct=ai_probability_pct,
                code_similarity_pct=code_similarity_pct,
                risk_score=risk_score,
                plagiarism_score=similarity_score,       # alias for report-service
                ai_detection_score=ai_generated_score,   # alias for report-service
                is_plagiarism_flagged=is_plagiarism_flagged,
                is_ai_generated_flagged=is_ai_flagged,
                similarity_findings=[
                    {
                        "matched_submission_id": sf.matched_submission_id,
                        "similarity_score": sf.similarity_score,
                        "matched_segments": sf.matched_segments,
                    }
                    for sf in sim_findings
                ],
                findings=findings,
                summary=summary,
                raw_result=raw_result,
                created_at=doc.created_at,
                completed_at=completed_at,
            )

        except Exception as e:
            error_msg = str(e)
            if analysis_id in _IN_MEMORY_DOCS:
                _IN_MEMORY_DOCS[analysis_id].update({
                    "status": AnalysisStatus.FAILED,
                    "error_message": error_msg,
                    "completed_at": datetime.now(timezone.utc),
                })
            if self.col is not None:
                try:
                    await self.col.update_one(
                        {"analysis_id": analysis_id},
                        {"$set": {
                            "status": AnalysisStatus.FAILED,
                            "error_message": error_msg,
                            "completed_at": datetime.now(timezone.utc),
                        }},
                    )
                except Exception:
                    pass
            return AnalysisResponse(
                analysis_id=analysis_id,
                submission_id=request.submission_id,
                status=SchemaStatus.FAILED,
                findings=[f"Analysis failed: {error_msg}"],
                summary=f"Analysis could not be completed: {error_msg}",
                error_message=error_msg,
                created_at=doc.created_at,
            )

    # ----------------------------------------------------------------
    # GET BY analysis_id
    # ----------------------------------------------------------------

    async def get_by_id(self, analysis_id: str) -> AnalysisResponse | None:
        if self.col is not None:
            try:
                doc = await self.col.find_one({"analysis_id": analysis_id})
                if doc:
                    return self._to_response(doc)
            except Exception as e:
                print(f"[AnalysisService] Mongo query error ({e}); using memory.")
        doc = _IN_MEMORY_DOCS.get(analysis_id)
        if doc:
            return self._to_response(doc)
        return None

    # ----------------------------------------------------------------
    # GET BY submission_id
    # ----------------------------------------------------------------

    async def get_by_submission(self, submission_id: str) -> AnalysisResponse | None:
        if self.col is not None:
            try:
                # Find matching documents without unindexed global table sort to prevent 32MB sort memory limit error
                cursor = self.col.find({"submission_id": submission_id})
                matching_docs = await cursor.to_list(length=10)
                if matching_docs:
                    matching_docs.sort(key=lambda d: str(d.get("created_at", "")), reverse=True)
                    return self._to_response(matching_docs[0])
            except Exception as e:
                print(f"[AnalysisService] Mongo query error ({e}); using memory.")
        matching = [
            d for d in _IN_MEMORY_DOCS.values()
            if d.get("submission_id") == submission_id
        ]
        if matching:
            matching.sort(key=lambda d: str(d.get("created_at", "")), reverse=True)
            return self._to_response(matching[0])
        return None

    # ----------------------------------------------------------------
    # Helpers
    # ----------------------------------------------------------------

    async def _build_corpus(
        self,
        exclude_submission_id: str,
        exclude_student_id: str | None = None,
        assignment_id: str | None = None,
    ) -> list[dict]:
        """
        Load normalized texts from submissions belonging to the same assignment
        (excluding the current submission and any submissions from the same student)
        to form the peer similarity corpus.
        """
        corpus = []
        if self.col is not None:
            try:
                query = {
                    "status": AnalysisStatus.COMPLETED,
                    "submission_id": {"$ne": exclude_submission_id},
                    "normalized_text": {"$exists": True},
                }
                if exclude_student_id:
                    query["student_id"] = {"$ne": exclude_student_id}
                if assignment_id:
                    query["assignment_id"] = assignment_id

                cursor = self.col.find(
                    query,
                    {"submission_id": 1, "student_id": 1, "assignment_id": 1, "normalized_text": 1},
                )
                async for doc in cursor:
                    text = doc.get("normalized_text", "")
                    if text:
                        corpus.append({
                            "submission_id": doc["submission_id"],
                            "student_id": doc.get("student_id"),
                            "assignment_id": doc.get("assignment_id"),
                            "text": text,
                        })
            except Exception as e:
                print(f"[AnalysisService] Mongo corpus error ({e}); using memory.")

        for doc in _IN_MEMORY_DOCS.values():
            if (
                doc.get("status") == AnalysisStatus.COMPLETED
                and doc.get("submission_id") != exclude_submission_id
                and (not exclude_student_id or doc.get("student_id") != exclude_student_id)
                and (not assignment_id or doc.get("assignment_id") == assignment_id)
                and doc.get("normalized_text")
            ):
                if not any(c["submission_id"] == doc["submission_id"] for c in corpus):
                    corpus.append({
                        "submission_id": doc["submission_id"],
                        "student_id": doc.get("student_id"),
                        "assignment_id": doc.get("assignment_id"),
                        "text": doc["normalized_text"],
                    })
        return corpus

    def _to_response(self, doc: dict) -> AnalysisResponse:
        sim_score = doc.get("similarity_score")
        ai_score  = doc.get("ai_generated_score")
        text_sim  = doc.get("text_similarity_pct", sim_score)
        ai_prob   = doc.get("ai_probability_pct", ai_score)
        code_sim  = doc.get("code_similarity_pct", sim_score)
        risk_sc   = doc.get("risk_score", "Low")
        return AnalysisResponse(
            analysis_id=doc.get("analysis_id", ""),
            submission_id=doc.get("submission_id", ""),
            status=SchemaStatus(doc.get("status", "PENDING")),
            similarity_score=sim_score,
            ai_generated_score=ai_score,
            text_similarity_pct=text_sim,
            ai_probability_pct=ai_prob,
            code_similarity_pct=code_sim,
            risk_score=risk_sc,
            plagiarism_score=sim_score,
            ai_detection_score=ai_score,
            is_plagiarism_flagged=doc.get("is_plagiarism_flagged", False),
            is_ai_generated_flagged=doc.get("is_ai_generated_flagged", False),
            similarity_findings=doc.get("similarity_findings", []),
            findings=doc.get("findings", []),
            summary=doc.get("summary"),
            raw_result=doc.get("raw_result"),
            created_at=doc.get("created_at"),
            completed_at=doc.get("completed_at"),
            error_message=doc.get("error_message"),
        )
