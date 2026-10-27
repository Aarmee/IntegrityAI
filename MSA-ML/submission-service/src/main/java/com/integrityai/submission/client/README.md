# Submission Service — Feign Client (Inter-Service Communication) Layer

## 🎯 Purpose of this Package
Implements **Distributed Microservice Orchestration** via OpenFeign. When a student submits a paper or code file, the Submission Service coordinates across three separate microservices:
1. Validates the assignment with `faculty-service`.
2. Triggers asynchronous/synchronous ML analysis with `ai-analysis-service`.
3. Sends an email receipt to the student with `notification-service`.

---

## 📄 Files in this Package

### 1. `FacultyClient.java`
- **Why it is used**: Queries assignment details (due date, thresholds) from `faculty-service:8082`.
- **Method**: `getAssignmentById(assignmentId)`. Verifies that the assignment exists and is still open for submissions.

### 2. `AiAnalysisClient.java`
- **Why it is used**: Dispatches extracted document text to the Python FastAPI ML engine on `ai-analysis-service:8090`.
- **Method**: `analyzeSubmission(AnalysisRequest)`: Sends document sentences, text content, and metadata. Receives back AI content score, similarity percentage, and sentence-level highlights.

### 3. `NotificationClient.java`
- **Why it is used**: Dispatches real-time submission confirmation alerts and receipts to `notification-service:8084`.
- **Method**: `sendNotification(NotificationRequest)`: Triggers student receipt and faculty submission notification.
