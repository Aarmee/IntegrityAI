# Auth Service — Entity (Persistence Model) Layer

## 🎯 Purpose of this Package
The **Entity Layer** defines the object-relational mapping (ORM) models mapped directly to PostgreSQL database tables using Hibernate / JPA. It represents the persistent schema owned exclusively by the `auth-service` under the **Database-per-Service** pattern.

---

## 📄 Files in this Package

### `User.java`
- **Why it is used**: Represents a registered user record in the `users` PostgreSQL table.
- **Key Code & Annotations**:
  - `@Entity`: Designates this class as a persistent JPA table model.
  - `@Table(name = "users")`: Maps the entity to the `users` table in PostgreSQL.
  - `@Id @GeneratedValue(strategy = GenerationType.UUID)`: Automatically generates a secure 128-bit UUID for every registered user.
  - `@Column(unique = true, nullable = false)`: Enforces database-level uniqueness constraints on the user's `email`.
  - `@Enumerated(EnumType.STRING)`: Stores user roles (`STUDENT`, `FACULTY`, `ADMIN`) as readable varchar strings in the database rather than brittle integer ordinals.
  - `password`: Stores the **BCrypt salted hash** of the user's password (raw passwords are never stored in plain text).
  - `@CreationTimestamp` / `@UpdateTimestamp`: Automatically tracks account creation and last modified timestamps via Hibernate.
- **Data Flow**:
  - Populated during user registration by `AuthService`.
  - Stored into PostgreSQL via `UserRepository.save(user)`.
  - Read from PostgreSQL during login by `UserRepository.findByEmail(email)`.
