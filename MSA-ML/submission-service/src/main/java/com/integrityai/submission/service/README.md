# Submission Service — Service (Business Logic & Storage) Layer

## 🎯 Purpose of this Package
Handles file extraction, binary storage (AWS S3 and local disk fallback), and submission pipeline orchestration.

---

## 📄 Files in this Package

### 1. `SubmissionService.java`
- **Why it is used**: Orchestrates the entire submission flow:
  1. Validates that the assignment exists and is not closed.
  2. Uploads the raw binary file to cloud storage via `FileStorageService`.
  3. Saves the initial submission document into MongoDB with status `PENDING`.
  4. Calls `AiAnalysisClient` to run AI and plagiarism checks.
  5. Updates the MongoDB record with analysis scores and flags if thresholds are breached.
  6. Dispatches a submission receipt via `NotificationClient`.

### 2. `FileStorageService.java`
- **Why it is used**: Provides cloud-first object storage abstraction with automatic local disk fallback.
- **Key Capabilities**:
  - **AWS S3**: Uploads files to S3 bucket (`integrityai-submissions-aarmee`) using AWS SDK v2, returning an immutable S3 URI.
  - **Local Fallback**: If AWS credentials are not configured or network is offline, safely stores files under `uploads/submissions/{id}` so local demos work 100% reliably.
