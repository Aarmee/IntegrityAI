# AI Analysis Service — API Routes Layer

## 🎯 Purpose of this Package
FastAPI router layer exposing asynchronous HTTP endpoints for AI plagiarism analysis, health checks, and Prometheus metrics.

---

## 📄 Files in this Package

### `analysis_routes.py`
- **Why it is used**: Defines REST endpoints consumed by `submission-service` and `report-service`.
- **Key Endpoints**:
  - `GET /health`: Health probe returning `{"status": "UP", "service": "ai-analysis-service"}`.
  - `POST /api/analysis`: Triggers document analysis. Accepts `AnalysisRequest` with text content and returns `AnalysisResponse`.
  - `GET /api/analysis/{analysis_id}`: Retrieves cached analysis by unique ID.
  - `GET /api/analysis/submission/{submission_id}`: Retrieves latest analysis for a given student submission.
- **Data Flow**:
  - Receives request $\to$ calls `AnalysisService.run_analysis()` $\to$ returns JSON analysis response.
