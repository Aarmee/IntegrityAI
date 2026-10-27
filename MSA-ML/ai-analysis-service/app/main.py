"""
ai-analysis-service — FastAPI entry point.

Starts on port 8090 (configurable via PORT env var).
Connects to MongoDB Atlas on startup.
"""

from contextlib import asynccontextmanager

import time
from fastapi import FastAPI, Request, Response
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
# Prometheus Metrics Endpoint & Middleware
# ---------------------------------------------------------------------------

metrics_state = {
    "start_time": time.time(),
    "requests_total": 0,
    "status_counts": {},
}

@app.middleware("http")
async def prometheus_metrics_collector(request: Request, call_next):
    metrics_state["requests_total"] += 1
    response = await call_next(request)
    status_str = str(response.status_code)
    metrics_state["status_counts"][status_str] = metrics_state["status_counts"].get(status_str, 0) + 1
    return response

@app.get("/metrics", tags=["Monitoring"], include_in_schema=False)
async def prometheus_metrics():
    """Expose standard Prometheus metrics format for scraping."""
    uptime = time.time() - metrics_state["start_time"]
    lines = [
        "# HELP http_requests_total Total number of HTTP requests handled by ai-analysis-service",
        "# TYPE http_requests_total counter",
        f'http_requests_total {metrics_state["requests_total"]}',
        "# HELP process_uptime_seconds Service uptime in seconds",
        "# TYPE process_uptime_seconds gauge",
        f'process_uptime_seconds {uptime:.2f}',
    ]
    for sc, count in metrics_state["status_counts"].items():
        lines.append(f'http_requests_by_status_total{{status="{sc}"}} {count}')
    lines.append("")
    return Response(content="\n".join(lines), media_type="text/plain; version=0.0.4; charset=utf-8")


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
