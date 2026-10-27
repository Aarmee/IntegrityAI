# Report Service — Entity Layer

## 🎯 Purpose of this Package
Defines JPA models mapped to the `integrityai_report` PostgreSQL database.

---

## 📄 Files in this Package

### 1. `Report.java`
- **Why it is used**: Database entity representing the `reports` table in PostgreSQL.
- **Key Fields**:
  - `id`: Report UUID.
  - `submissionId`, `assignmentId`, `studentId`: References to correlated entities.
  - `overallSimilarityScore`, `overallAiScore`: Double precision percentage metrics.
  - `analysisDetailsJson`: Text/JSON column storing the sentence-level highlight map for interactive visual rendering on the frontend.
  - `facultyComments`, `reviewedByFacultyId`: Professor audit notes.
  - `status`: Enum (`PENDING`, `GENERATED`, `REVIEWED`, `OVERRIDDEN`).

### 2. `ReportStatus.java`
- Lifecycle states of an academic integrity report.
