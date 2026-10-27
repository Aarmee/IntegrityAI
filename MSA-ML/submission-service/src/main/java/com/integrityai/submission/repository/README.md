# Submission Service — Repository (MongoDB Data Access) Layer

## 🎯 Purpose of this Package
Spring Data MongoDB repository interface for document querying.

---

## 📄 Files in this Package

### `SubmissionRepository.java`
- **Why it is used**: Executes queries against the MongoDB Atlas `submissions` collection.
- **Key Methods**:
  - `extends MongoRepository<Submission, String>`: Inherits NoSQL document CRUD operations.
  - `List<Submission> findByStudentId(String studentId)`: Fetches past submission history for a student.
  - `List<Submission> findByAssignmentId(String assignmentId)`: Retrieves all submissions for an assignment for professor evaluation.
  - `Optional<Submission> findByAssignmentIdAndStudentId(String assignmentId, String studentId)`: Prevents accidental duplicate submissions if multiple uploads are disabled.
