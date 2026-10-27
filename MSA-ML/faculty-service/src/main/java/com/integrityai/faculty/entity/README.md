# Faculty Service — Entity (Persistence Model) Layer

## 🎯 Purpose of this Package
Defines JPA domain entities mapped to the `integrityai_faculty` PostgreSQL database.

---

## 📄 Files in this Package

### 1. `Assignment.java`
- **Why it is used**: Database entity representing the `assignments` table.
- **Key Code & Annotations**:
  - `@Entity @Table(name = "assignments")`: Maps to PostgreSQL.
  - `@Id @GeneratedValue(strategy = GenerationType.UUID)`: Unique assignment identifier.
  - `facultyId`: Foreign key reference storing the UUID of the professor who owns this assignment.
  - `similarityThreshold`, `aiThreshold`: Configurable plagiarism boundaries.
  - `dueDate`: Future timestamp after which student submissions may be marked as late.

### 2. `Faculty.java`
- **Why it is used**: Database entity representing the `faculty_profiles` table, storing department, office hours, and academic credentials.
