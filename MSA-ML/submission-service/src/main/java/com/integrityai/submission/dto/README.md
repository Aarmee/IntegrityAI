# Submission Service — DTO (Data Transfer Object) Layer

## 🎯 Purpose of this Package
Contracts for file upload requests, inter-service analysis payloads, and submission responses.

---

## 📄 Files in this Package

### 1. `FileUploadResponse.java`
- **Why it is used**: Response returned immediately after a student uploads a file, confirming upload receipt, file size, storage key, and initial status (`PENDING_ANALYSIS`).

### 2. `AnalysisRequest.java` / `AnalysisResponse.java`
- **Why it is used**: Payloads exchanged with the Python `ai-analysis-service`. Contains document sentences, raw text, course code, and receives back calculated similarity and AI content probability scores.

### 3. `AssignmentResponse.java`
- **Why it is used**: Captures assignment specifications retrieved via `FacultyClient`.

### 4. `NotificationRequest.java`
- **Why it is used**: Dispatches submission receipt data to `NotificationClient`.
