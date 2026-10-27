# Auth Service — Service (Business Logic) Layer

## 🎯 Purpose of this Package
The **Service Layer** encapsulates core domain logic and transactional boundaries. It coordinates authentication, password hashing, JWT generation, uniqueness validation, and publishes registration welcome events to the `notification-service`.

---

## 📄 Files in this Package

### 1. `AuthService.java`
- **Why it is used**: Orchestrates user onboarding, identity verification, password hashing, and user profile updates.
- **Key Code & Annotations**:
  - `@Service`: Declares this class as a Spring business service bean.
  - `@Transactional`: Guarantees database atomicity for registration and updates.
  - `PasswordEncoder.encode(rawPassword)`: Hashes passwords using BCrypt with salt before saving to database.
  - `PasswordEncoder.matches(rawPassword, encodedPassword)`: Securely verifies credentials during login.
  - Integration with `notification-service`: Triggers an onboarding welcome email upon successful user registration.
- **Data Flow**:
  - Receives validated DTO from `AuthController`.
  - Queries `UserRepository` for existing accounts.
  - Generates token via `JwtService`.
  - Returns `LoginResponse` containing token and user claims.

### 2. `JwtService.java`
- **Why it is used**: Generates, signs, and validates JSON Web Tokens (JWT).
- **Key Code & Annotations**:
  - `Jwts.builder()`: Constructs signed JWT payloads.
  - Encodes claims:
    - `sub`: User ID (UUID)
    - `email`: User's registered email
    - `role`: Role string (`STUDENT`, `FACULTY`, `ADMIN`)
    - `iat`: Issued at timestamp
    - `exp`: Expiration timestamp (default 24 hours / 86,400,000 ms)
  - `signWith(Keys.hmacShaKeyFor(secret.getBytes()))`: Cryptographically signs the token with a 256-bit secret key using HMAC-SHA256 algorithm.
