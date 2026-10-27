# Faculty Service — DTO (Data Transfer Object) Layer

## 🎯 Purpose of this Package
Contains input and output contracts for assignments and faculty profiles. DTOs validate incoming form payloads and provide clean, presentation-ready response objects.

---

## 📄 Files in this Package

### 1. `AssignmentRequest.java`
- **Why it is used**: Captures parameters when a faculty member publishes an assignment.
- **Key Fields & Validation**:
  - `title`: Assignment title (`@NotBlank`).
  - `description`: Assignment instructions and problem statement.
  - `courseCode`: Course identifier (e.g. `MCA-501`).
  - `dueDate`: Deadline timestamp.
  - `similarityThreshold`: Maximum allowable similarity score (default 20%). Submissions exceeding this threshold are flagged automatically.
  - `aiThreshold`: Maximum allowable AI-generated content score.

### 2. `AssignmentResponse.java`
- **Why it is used**: Output payload sent back to students and faculty, including calculated fields like `isExpired` and total submission count.

### 3. `FacultyRequest.java` / `FacultyResponse.java`
- **Why it is used**: Input/output objects representing faculty department, office location, research domains, and academic designations.
