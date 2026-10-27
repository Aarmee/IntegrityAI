# Submission Service — Entity (MongoDB Document) Layer

## 🎯 Purpose of this Package
Defines the NoSQL MongoDB domain document models for stored submissions.

---

## 📄 Files in this Package

### 1. `Submission.java`
- **Why it is used**: Represents the stored document inside the `submissions` collection in **MongoDB Atlas**.
- **Key Code & Annotations**:
  - `@Document(collection = "submissions")`: Maps to MongoDB document collection.
  - `@Id`: MongoDB string ObjectId.
  - `assignmentId`, `studentId`, `studentName`: Identifiers linking submission to assignment and student.
  - `fileName`, `fileType`, `fileSizeBytes`, `fileStoragePath`: Metadata and AWS S3 object key.
  - `status`: Enum representing lifecycle state: `PENDING`, `ANALYZING`, `COMPLETED`, `FLAGGED`, `FAILED`.
  - `similarityScore`, `aiScore`: Calculated percentage scores.
  - `isLate`: Boolean indicating if submitted after assignment deadline.

### 2. `FileType.java` & `SubmissionStatus.java`
- **Why it is used**: Enumerations defining supported file formats (`PDF`, `DOCX`, `TXT`, `SOURCE_CODE`) and valid lifecycle transitions.
