"""
MongoDB document model for analysis results.
Collection: analyses
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class AnalysisStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class SimilarityFinding(BaseModel):
    """A single similarity match against another submission."""
    matched_submission_id: str
    similarity_score: float
    matched_segments: list[str] = []


class AnalysisDocument(BaseModel):
    """
    Full analysis result stored in MongoDB.
    _id is the MongoDB ObjectId (stored as string for JSON compatibility).
    """
    id: Optional[str] = Field(default=None, alias="_id")
    analysis_id: str                     # UUID string — returned to callers
    submission_id: str
    student_id: Optional[str] = None
    assignment_id: Optional[str] = None
    status: AnalysisStatus = AnalysisStatus.PENDING

    # Scores — 0.0 to 100.0
    similarity_score: Optional[float] = None     # plagiarism
    ai_generated_score: Optional[float] = None   # AI detection
    text_similarity_pct: Optional[float] = None
    ai_probability_pct: Optional[float] = None
    code_similarity_pct: Optional[float] = None
    risk_score: Optional[str] = "Low"            # Low, Medium, High

    # Flags
    is_plagiarism_flagged: bool = False
    is_ai_generated_flagged: bool = False

    # Detailed findings
    similarity_findings: list[SimilarityFinding] = []
    linguistic_features: dict = {}
    findings: list[str] = []            # human-readable finding strings

    # Summary and raw result
    summary: Optional[str] = None
    raw_result: Optional[str] = None    # JSON string of full details

    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        populate_by_name = True
