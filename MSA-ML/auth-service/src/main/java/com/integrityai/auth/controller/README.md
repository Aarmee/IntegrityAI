# Auth Service — Controller Layer

## 🎯 Purpose of this Package
The **Controller Layer** provides RESTful HTTP endpoints for user registration, authentication (login), password verification, and profile management. It handles request validation, maps HTTP status codes, and delegates business logic to `AuthService`.

---

## 📄 Files in this Package

### `AuthController.java`
- **Why it is used**: Single entry point for user identity operations. It exposes standard endpoints such as `/api/auth/register`, `/api/auth/login`, and `/api/users/{id}`.
- **Key Code & Annotations**:
  - `@RestController`: Denotes this class as a Spring REST Controller that serializes responses directly to JSON.
  - `@RequestMapping`: Bases routes at `/api/auth` and `/api/users`.
  - `@PostMapping("/register")`: Handles student and faculty account creation. Accepts `@Valid @RequestBody RegisterRequest`.
  - `@PostMapping("/login")`: Authenticates credentials against hashed passwords using BCrypt. Returns a JWT Bearer token inside `LoginResponse`.
  - `@GetMapping("/users/{id}")`: Fetches public profile details for a given user UUID.
  - `@PutMapping("/users/{id}")`: Updates user name, department, or profile data.
- **Data Flow**:
  1. **Input**: Gateway forwards JSON payload (`email`, `password`, `fullName`, `role`).
  2. **Validation**: `@Valid` checks field constraints (email syntax, password length).
  3. **Delegation**: Calls `authService.login(...)` or `authService.register(...)`.
  4. **Output**: Returns `ResponseEntity<LoginResponse>` with HTTP 200 OK or HTTP 201 Created.
