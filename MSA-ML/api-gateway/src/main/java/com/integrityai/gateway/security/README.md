# API Gateway — Security & Authentication Layer

## 🎯 Purpose of this Package
This package implements **Perimeter Security** for the entire microservices cluster. In Microservices Architecture (MSA), the API Gateway acts as the security gatekeeper: it intercepts every incoming HTTP request, validates the JWT Bearer token, enforces CORS policies, and blocks unauthorized requests before they can consume resources in internal services.

---

## 📄 Files in this Package

### 1. `GatewaySecurityConfig.java`
- **Why it is used**: Configures the Spring Security filter chain (`SecurityFilterChain`) and Global CORS (Cross-Origin Resource Sharing) policies.
- **Key Code & Annotations**:
  - `@Configuration`: Declares this class as a Spring bean source for security configurations.
  - `@Bean SecurityFilterChain`: Builds the HTTP security rules.
  - `.csrf(csrf -> csrf.disable())`: Disables CSRF protection since our microservices are stateless and use Bearer tokens (JWT) rather than session cookies.
  - `.requestMatchers("/api/auth/**", "/actuator/**", "/").permitAll()`: Declares public paths that do not require authentication (e.g. login, register, health checks).
  - `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`: Injects our custom `JwtAuthFilter` directly into the Spring Security chain.
  - `CorsConfigurationSource`: Configures permitted origins (`http://localhost:5173`), HTTP methods (`GET, POST, PUT, DELETE, OPTIONS`), and headers (`Authorization, Content-Type`).

### 2. `JwtAuthFilter.java`
- **Why it is used**: Intercepts every protected request, extracts the `Authorization: Bearer <token>` header, parses the JWT signature using the HMAC-SHA256 secret key, and establishes the authenticated security context.
- **Key Code & Annotations**:
  - `OncePerRequestFilter`: Guarantees this filter is executed exactly once per incoming request.
  - `Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token)`: Validates token expiration, signature integrity, and decodes the user's ID, email, and Role (`STUDENT`, `FACULTY`, `ADMIN`).
  - `SecurityContextHolder.getContext().setAuthentication(...)`: Places the validated user identity into Spring's ThreadLocal security context.
- **Data Flow**:
  1. Client sends `POST /api/submissions` with header `Authorization: Bearer eyJhbG...`.
  2. `JwtAuthFilter` intercepts the request on port `8080`.
  3. If token is invalid or expired: Rejects immediately with **HTTP 401 Unauthorized**.
  4. If token is valid: Injects user headers (`X-User-Id`, `X-User-Role`) and forwards the request to downstream `submission-service:8083`.
