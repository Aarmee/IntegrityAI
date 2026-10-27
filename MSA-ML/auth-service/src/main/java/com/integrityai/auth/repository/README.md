# Auth Service — Repository (Data Access) Layer

## 🎯 Purpose of this Package
The **Repository Layer** provides the abstraction for database operations against PostgreSQL. Built on **Spring Data JPA**, it provides CRUD functionality and declarative query methods without requiring manual boilerplate SQL/JDBC code.

---

## 📄 Files in this Package

### `UserRepository.java`
- **Why it is used**: Manages persistence, retrieval, and uniqueness checks for `User` entities in the PostgreSQL database.
- **Key Code & Annotations**:
  - `extends JpaRepository<User, String>`: Inherits standard database methods: `save()`, `findById()`, `findAll()`, `deleteById()`, and pagination support.
  - `Optional<User> findByEmail(String email)`: Query derivation method. Spring Data automatically generates the SQL query:
    ```sql
    SELECT * FROM users WHERE email = ? LIMIT 1;
    ```
    Used during login to locate the account by email.
  - `boolean existsByEmail(String email)`: Used during registration to quickly verify whether an email is already registered before attempting an insert.
- **Data Flow**:
  - Injected into `AuthService` via constructor dependency injection.
  - Communicates directly over JDBC/HikariCP pool to PostgreSQL.
