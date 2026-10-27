# Submission Service — Exception Handling Layer

## 🎯 Purpose of this Package
Centralizes error handling for file uploads, size limits, format validation, and inter-service communication failures.

---

## 📄 Files in this Package

### `GlobalExceptionHandler.java`
- **Why it is used**: Translates exceptions into clean JSON error responses.
- **Key Interceptions**:
  - `MaxUploadSizeExceededException`: Handles files larger than the 20MB limit with a friendly `413 Payload Too Large` message.
  - `UnsupportedFileTypeException`: Returns `415 Unsupported Media Type` when a student attempts to upload non-whitelisted formats (e.g. `.exe`, `.zip`).
  - `FeignException`: Intercepts downstream service outages (e.g. if `ai-analysis-service` is temporarily slow) and converts them into graceful degraded responses.
