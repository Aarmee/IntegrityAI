"""
ai-analysis-service — FastAPI entry point.

Starts on port 8090 (configurable via PORT env var).
Connects to MongoDB Atlas on startup.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.api.analysis_routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB on startup; close cleanly on shutdown."""
    client = None
    try:
        client = AsyncIOMotorClient(
            settings.mongodb_uri,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=4000,
        )
        app.state.db = client[settings.mongodb_database]

        # Ensure index on submission_id for fast lookups
        await app.state.db["analyses"].create_index("submission_id")
        await app.state.db["analyses"].create_index("analysis_id", unique=True)
        print(f"[ai-analysis-service] Connected to MongoDB: {settings.mongodb_database}")
    except Exception as e:
        print(f"[ai-analysis-service] WARNING: MongoDB Atlas connection delayed/offline ({e}). Using in-memory fallback store.")
        # Provide a dummy or retain client object for later retry
        if client:
            app.state.db = client[settings.mongodb_database]
        else:
            app.state.db = None

    yield

    if client:
        client.close()
        print("[ai-analysis-service] MongoDB connection closed")


app = FastAPI(
    title="IntegrityAI — Analysis Service",
    description=(
        "Plagiarism detection and AI-generated content analysis for student submissions.\n\n"
        "**Limitations:** Uses TF-IDF + cosine similarity and statistical heuristics. "
        "Results are indicative, not conclusive. Human review is recommended for flagged submissions."
    ),
    version="1.0.0",
    lifespan=lifespan,
)
app.state.db = None

app.include_router(router)


# ---------------------------------------------------------------------------
# Global exception handler — never expose internal errors to clients
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "status": 500,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later.",
        },
    )


# ---------------------------------------------------------------------------
# Entry point for direct execution
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
