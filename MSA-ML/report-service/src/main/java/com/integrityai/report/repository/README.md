# Report Service — Repository Layer

## 🎯 Purpose of this Package
Spring Data JPA query interface for the `reports` PostgreSQL table.

---

## 📄 Files in this Package

### `ReportRepository.java`
- **Key Methods**:
  - `Optional<Report> findBySubmissionId(String submissionId)`: Retrieves the integrity report for a given student submission.
  - `List<Report> findByAssignmentId(String assignmentId)`: Retrieves all audit reports for a particular assignment class roster.
