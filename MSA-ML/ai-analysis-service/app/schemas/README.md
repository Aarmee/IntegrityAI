# AI Analysis Service — Pydantic Schemas Layer

## 🎯 Purpose of this Package
Defines Pydantic v2 data models for strict input validation, type coercion, and OpenAPI/Swagger documentation generation in FastAPI.

---

## 📄 Files in this Package

### `analysis_schema.py`
- **Why it is used**: Defines request and response contracts for all ML operations.
- **Key Schemas**:
  - `AnalysisRequest`: Validates incoming payload (`submission_id`, `text_content`, `file_type`, `sentences`).
  - `SentenceAnalysis`: Model for individual highlighted sentence with `is_ai`, `ai_score`, `is_plagiarized`, and `reason`.
  - `AnalysisResponse`: Complete response returned to Java `submission-service`.
  - `HealthResponse`: Standard format for `/health` endpoint.
