"""
Pydantic schemas for API request/response validation.
Kept separate from the MongoDB document model.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class AnalysisStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class AnalysisRequest(BaseModel):
    """
    Sent by report-service (or submission-service) to trigger analysis.

    Either text_content or file_path must be provided so the service
    can extract text for analysis.
    """
    submission_id: str = Field(..., description="UUID of the submission")
    student_id: Optional[str] = Field(default=None, description="UUID of student (to prevent self-plagiarism match)")
    assignment_id: Optional[str] = Field(default=None, description="UUID of assignment")
    text_content: Optional[str] = Field(
        default=None,
        description="Raw text content to analyse (preferred)"
    )
    file_path: Optional[str] = Field(
        default=None,
        description="Filesystem path to the uploaded file (fallback)"
    )

    @field_validator("submission_id")
    @classmethod
    def submission_id_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("submission_id must not be empty")
        return v.strip()


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------

class SimilarityFindingResponse(BaseModel):
    matched_submission_id: str
    similarity_score: float
    matched_segments: list[str] = []


class AnalysisResponse(BaseModel):
    """Full analysis result returned to callers."""
    analysis_id: str
    submission_id: str
    status: AnalysisStatus

    # Scores (None while PENDING/PROCESSING)
    similarity_score: Optional[float] = None
    ai_generated_score: Optional[float] = None
    text_similarity_pct: Optional[float] = None
    ai_probability_pct: Optional[float] = None
    code_similarity_pct: Optional[float] = None
    risk_score: Optional[str] = "Low"

    # Flags
    is_plagiarism_flagged: bool = False
    is_ai_generated_flagged: bool = False

    # Details
    similarity_findings: list[SimilarityFindingResponse] = []
    findings: list[str] = []
    summary: Optional[str] = None

    # For backward compat with report-service AnalysisResult DTO
    plagiarism_score: Optional[float] = None     # alias of similarity_score
    ai_detection_score: Optional[float] = None   # alias of ai_generated_score
    raw_result: Optional[str] = None

    # Timestamps
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
