# Faculty Service — Repository (Data Access) Layer

## 🎯 Purpose of this Package
Spring Data JPA interfaces providing database querying for assignments and faculty profiles.

---

## 📄 Files in this Package

### 1. `AssignmentRepository.java`
- **Why it is used**: Executes queries against the `assignments` table in PostgreSQL.
- **Key Methods**:
  - `List<Assignment> findByFacultyId(String facultyId)`: Returns all assignments created by a specific professor.
  - `List<Assignment> findByDueDateAfter(LocalDateTime now)`: Returns all currently active/open assignments.

### 2. `FacultyRepository.java`
- **Why it is used**: Manages CRUD operations for faculty profiles.
  - `Optional<Faculty> findByUserId(String userId)`: Retrieves academic profile for a given user UUID.
