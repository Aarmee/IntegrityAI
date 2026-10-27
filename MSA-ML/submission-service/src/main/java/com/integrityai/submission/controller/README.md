# Submission Service — Controller Layer

## 🎯 Purpose of this Package
Exposes REST endpoints under `/api/submissions` for uploading documents, streaming submission history, and downloading student files.

---

## 📄 Files in this Package

### `SubmissionController.java`
- **Why it is used**: Primary REST interface for student document submissions.
- **Key Endpoints & Annotations**:
  - `@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)`: Accepts student multipart document uploads (PDF, DOCX, TXT, PY, JAVA, CPP).
  - `@GetMapping("/{id}")`: Retrieves full submission record, status, and attached AI report.
  - `@GetMapping("/student/{studentId}")`: Lists all past submissions made by a specific student.
  - `@GetMapping("/assignment/{assignmentId}")`: Lists all student submissions for a given assignment (for faculty grading).
  - `@GetMapping("/{id}/download")`: Streams the original submitted file from AWS S3 / local storage back to the browser.
