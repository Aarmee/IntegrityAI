# Auth Service — DTO (Data Transfer Object) Layer

## 🎯 Purpose of this Package
The **DTO Layer** decouples the internal JPA database entities from the external API contracts. DTOs prevent over-fetching, protect sensitive database columns (like hashed password salts) from leaking to the frontend, and apply strict input validation rules using Jakarta Validation annotations.

---

## 📄 Files in this Package

### 1. `LoginRequest.java`
- **Why it is used**: Encapsulates incoming user login credentials.
- **Key Code & Annotations**:
  - `@NotBlank(message = "Email is required")`: Prevents empty strings.
  - `@Email(message = "Invalid email format")`: Validates valid email patterns.
  - `@NotBlank(message = "Password is required")`: Ensures password is provided.

### 2. `LoginResponse.java`
- **Why it is used**: Structured response returned to the client upon successful authentication.
- **Fields**:
  - `token`: The signed JWT Bearer string used for subsequent authenticated requests.
  - `type`: Default `"Bearer"`.
  - `user`: Sanitized user metadata (`userId`, `email`, `fullName`, `role`). Notice that the password hash is **never** included.

### 3. `RegisterRequest.java`
- **Why it is used**: Captures student/faculty registration details from the signup form.
- **Key Code & Annotations**:
  - `@Size(min = 6, message = "Password must be at least 6 characters")`: Enforces minimum password complexity.
  - `Role`: Enum field accepting `STUDENT`, `FACULTY`, or `ADMIN`.
  - `department`, `institution`: Optional academic organization fields.

### 4. `UpdateProfileRequest.java`
- **Why it is used**: Allows students and faculty to update their display names, department, or bio without changing their login credentials.

### 5. `UserResponse.java`
- **Why it is used**: Public profile projection of the `User` entity used when querying `/api/users/{id}` or listing users for admin views.
