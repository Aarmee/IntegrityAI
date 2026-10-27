# Report Service — Service Layer

## 🎯 Purpose of this Package
Implements report generation logic, threshold evaluations, sentence-level JSON serialization, and faculty audit review workflows.

---

## 📄 Files in this Package

### `ReportService.java`
- **Why it is used**: Core business service for report lifecycle management.
- **Key Operations**:
  - `generateReport(ReportRequest)`: Aggregates ML metrics from the AI engine, evaluates if scores exceed assignment similarity thresholds, persists the report in PostgreSQL, and alerts faculty if plagiarism is detected.
  - `reviewReport(reportId, ReviewRequest)`: Updates report status with professor verification notes.
  - `getReportBySubmissionId()`: Formats complete report with sentence highlights for the frontend document paper viewer.
