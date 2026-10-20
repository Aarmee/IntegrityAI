"""
API routes for the analysis service.

Endpoints:
  GET  /health                          — health check
  POST /api/analysis                    — trigger new analysis
  GET  /api/analysis/{analysis_id}      — get by analysis ID
  GET  /api/analysis/submission/{sub}   — get latest analysis for a submission
"""

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.analysis_schema import (
    AnalysisRequest,
    AnalysisResponse,
    HealthResponse,
)
from app.services.analysis_service import AnalysisService

router = APIRouter()


def get_db():
    """
    Dependency — returns the MongoDB database instance injected at startup.
    Overridden during tests via app.dependency_overrides.
    """
    from app.main import app
    return getattr(app.state, "db", None)


def get_service(db = Depends(get_db)) -> AnalysisService:
    return AnalysisService(db)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    return HealthResponse(
        status="UP",
        service="ai-analysis-service",
        version="1.0.0",
    )


# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------

@router.post("/api/analysis", response_model=AnalysisResponse, status_code=201, tags=["Analysis"])
async def create_analysis(
    request: AnalysisRequest,
    service: AnalysisService = Depends(get_service),
):
    """
    Trigger AI analysis for a submission.

    Provide either:
    - `text_content`: the raw text to analyse (preferred), or
    - `file_path`: path to the uploaded file on disk

    The analysis runs synchronously and returns the result.
    Status will be COMPLETED or FAILED.
    """
    return await service.analyse(request)


@router.get(
    "/api/analysis/submission/{submission_id}",
    response_model=AnalysisResponse,
    tags=["Analysis"],
)
async def get_analysis_by_submission(
    submission_id: str,
    service: AnalysisService = Depends(get_service),
):
    """Get the most recent analysis for a given submission ID."""
    result = await service.get_by_submission(submission_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No analysis found for submission ID: {submission_id}",
        )
    return result


@router.get(
    "/api/analysis/{analysis_id}",
    response_model=AnalysisResponse,
    tags=["Analysis"],
)
async def get_analysis_by_id(
    analysis_id: str,
    service: AnalysisService = Depends(get_service),
):
    """Get a specific analysis by its ID."""
    result = await service.get_by_id(analysis_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis not found with ID: {analysis_id}",
        )
    return result
