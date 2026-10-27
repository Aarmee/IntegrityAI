# Report Service — DTO Layer

## 🎯 Purpose of this Package
Contracts for report requests, analysis payloads, and faculty reviews.

---

## 📄 Files in this Package

### 1. `ReportRequest.java` / `ReportResponse.java`
- Contains submission ID, student name, assignment ID, overall AI score, overall similarity score, highlighted text snippets, and status.

### 2. `AnalysisResult.java`
- Represents raw sentence-by-sentence analysis output from the ML engine (sentence text, AI probability, similarity match, matching source).

### 3. `ReviewRequest.java`
- Captures professor review actions: decision (`APPROVED`, `REJECTED`, `FLAGGED_ACADEMIC_DISHONESTY`) and qualitative faculty comments.

### 4. `NotificationRequest.java`
- Payload dispatched to `NotificationClient`.
