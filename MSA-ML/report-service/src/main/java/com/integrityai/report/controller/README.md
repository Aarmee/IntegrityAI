# Report Service — Controller Layer

## 🎯 Purpose of this Package
Exposes RESTful endpoints under `/api/reports` for generating, viewing, filtering, and reviewing academic integrity audit reports.

---

## 📄 Files in this Package

### `ReportController.java`
- **Why it is used**: Primary REST interface for audit reports.
- **Key Endpoints**:
  - `@PostMapping`: Generates a new comprehensive report for a submission.
  - `@GetMapping("/{id}")`: Retrieves report metrics, overall similarity score, AI probability score, and highlighted sentences.
  - `@GetMapping("/submission/{submissionId}")`: Fetches report associated with a specific submission UUID.
  - `@PutMapping("/{id}/review")`: Allows a professor to append academic review notes, mark as verified, or override false positives.
