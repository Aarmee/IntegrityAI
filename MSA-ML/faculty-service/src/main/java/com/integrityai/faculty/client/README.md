# Faculty Service — Feign Client (Inter-Service Communication) Layer

## 🎯 Purpose of this Package
Demonstrates **Synchronous Inter-Service Communication** via **Spring Cloud OpenFeign**. In Microservices Architecture, services must never directly touch another service's database. When `faculty-service` needs user identity verification, it calls `auth-service` via this Feign HTTP client interface.

---

## 📄 Files in this Package

### `AuthClient.java`
- **Why it is used**: Declarative HTTP REST client to query user data from `auth-service`.
- **Key Code & Annotations**:
  - `@FeignClient(name = "auth-service", url = "${auth.service.url:http://localhost:8081}")`: Spring Cloud OpenFeign client that automatically generates the HTTP request execution at runtime.
  - `@GetMapping("/api/users/{userId}")`: Hits the Auth Service endpoint to verify whether the faculty user UUID exists and has the `FACULTY` role.
- **Data Flow**:
  1. Professor creates an assignment.
  2. `FacultyService` calls `authClient.getUserById(facultyId)`.
  3. Feign executes an HTTP GET request to `auth-service:8081`.
  4. If the user is verified, assignment creation proceeds; otherwise, an unauthorized error is returned.
