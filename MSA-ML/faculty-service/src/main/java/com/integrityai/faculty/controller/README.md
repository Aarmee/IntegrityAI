# Faculty Service — Controller Layer

## 🎯 Purpose of this Package
Exposes RESTful endpoints for professors to manage academic assignments, set due dates, configure plagiarism similarity thresholds, and manage faculty department profiles.

---

## 📄 Files in this Package

### 1. `AssignmentController.java`
- **Why it is used**: Handles all assignment lifecycle operations: creation, updates, deletion, and public listings.
- **Key Code & Annotations**:
  - `@RestController @RequestMapping("/api/assignments")`: Exposes routes under `/api/assignments`.
  - `@PostMapping`: Creates a new assignment. Requires `@Valid @RequestBody AssignmentRequest`.
  - `@GetMapping`: Retrieves all active assignments for student dashboards.
  - `@GetMapping("/{id}")`: Retrieves assignment specifications, due date, and similarity threshold.
  - `@GetMapping("/faculty/{facultyId}")`: Lists all assignments created by a specific professor.

### 2. `FacultyController.java`
- **Why it is used**: Exposes endpoints under `/api/faculty` to retrieve and update faculty academic profiles, department affiliations, and designations.
