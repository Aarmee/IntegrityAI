# Faculty Service — Configuration & Security Layer

## 🎯 Purpose of this Package
Enforces Role-Based Access Control (RBAC) and parses incoming JWT Bearer tokens propagated by the API Gateway or client.

---

## 📄 Files in this Package

### 1. `SecurityConfig.java`
- **Why it is used**: Configures Spring Security rules for the Faculty Service.
- **Key Code & Annotations**:
  - `@Configuration`: Declares security bean provider.
  - `@EnableMethodSecurity`: Enables method-level security annotations like `@PreAuthorize("hasRole('FACULTY')")`.
  - `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`: Injects JWT token validation into the request pipeline.

### 2. `JwtAuthFilter.java`
- **Why it is used**: Parses the incoming `Authorization: Bearer <token>` header, decodes the role (`FACULTY` or `STUDENT`), and populates Spring's `SecurityContext`.
- **Key Code & Annotations**:
  - Extracts JWT claims using the shared 256-bit secret key.
  - Grants Spring `GrantedAuthority` (e.g. `ROLE_FACULTY`, `ROLE_STUDENT`) so controllers can restrict actions by role.
