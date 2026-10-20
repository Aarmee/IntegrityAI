"""
Plagiarism (similarity) detection service.

Uses TF-IDF vectorisation + cosine similarity to compare a submission
against all previously stored submissions in the analysis database.

Guards against self-plagiarism / draft self-matching:
Submissions from the same student are excluded from comparison.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.utils.text_normalizer import normalize, extract_ngrams


def compute_similarity(
    target_text: str,
    corpus: list[dict],  # list of {"submission_id": str, "student_id": str | None, "text": str}
    exclude_student_id: str | None = None,
    exclude_submission_id: str | None = None,
    top_n: int = 5,
) -> dict:
    """
    Compare target_text against a corpus of previously analysed texts.
    Excludes the student's own submissions/drafts to prevent self-matching.
    """
    target_norm = normalize(target_text)

    # Filter out entries from the same student or current submission
    filtered_corpus = []
    for c in corpus:
        if exclude_submission_id and str(c.get("submission_id")) == str(exclude_submission_id):
            continue
        if exclude_student_id and c.get("student_id") and str(c.get("student_id")) == str(exclude_student_id):
            continue
        filtered_corpus.append(c)

    if not target_norm or not filtered_corpus:
        return {
            "similarity_score": 0.0,
            "findings": [],
            "feature_details": {"corpus_size": len(filtered_corpus), "method": "tfidf_cosine"},
        }

    # Build texts list: target first, then filtered corpus
    corpus_texts = [c["text"] for c in filtered_corpus]
    all_texts = [target_norm] + corpus_texts

    try:
        vectorizer = TfidfVectorizer(
            analyzer="word",
            ngram_range=(1, 3),
            min_df=1,
            sublinear_tf=True,
            max_features=10_000,
        )
        tfidf_matrix = vectorizer.fit_transform(all_texts)

        # cosine similarity of target (row 0) against all corpus entries
        target_vec = tfidf_matrix[0:1]
        corpus_matrix = tfidf_matrix[1:]

        if corpus_matrix.shape[0] == 0:
            return {
                "similarity_score": 0.0,
                "findings": [],
                "feature_details": {"corpus_size": 0, "method": "tfidf_cosine"},
            }

        similarities = cosine_similarity(target_vec, corpus_matrix)[0]

    except Exception as e:
        return {
            "similarity_score": 0.0,
            "findings": [],
            "feature_details": {"error": str(e), "method": "tfidf_cosine"},
        }

    # Aggregate score: weighted average of top-N similarities
    top_indices = np.argsort(similarities)[::-1][:top_n]
    top_scores = similarities[top_indices]

    # Aggregate as maximum similarity
    aggregate_score = float(np.max(top_scores)) * 100 if len(top_scores) > 0 else 0.0

    # Build findings list
    findings = []
    for idx in top_indices:
        score = float(similarities[idx])
        if score < 0.05:  # Ignore negligible matches (<5%)
            continue
        corpus_entry = filtered_corpus[idx]
        matched_segments = _find_common_ngrams(
            target_norm, normalize(corpus_entry["text"]), n=3, top_k=3
        )
        findings.append({
            "matched_submission_id": corpus_entry["submission_id"],
            "similarity_score": round(score * 100, 2),
            "matched_segments": matched_segments,
        })

    return {
        "similarity_score": round(aggregate_score, 2),
        "findings": findings,
        "feature_details": {
            "corpus_size": len(filtered_corpus),
            "method": "tfidf_cosine",
            "target_length_words": len(target_norm.split()),
        },
    }


def _find_common_ngrams(text_a: str, text_b: str, n: int = 3, top_k: int = 3) -> list[str]:
    """Return the top-k shared n-grams between two normalised texts."""
    ngrams_a = set(extract_ngrams(text_a, n))
    ngrams_b = set(extract_ngrams(text_b, n))
    common = ngrams_a & ngrams_b
    return list(common)[:top_k]
