# Report Service — Configuration Layer

## 🎯 Purpose of this Package
Configures Spring Security, JWT Bearer token validation, and OpenFeign interceptors for `report-service`.

---

## 📄 Files in this Package

### 1. `SecurityConfig.java` & `JwtAuthFilter.java`
- Enforces role-based permissions (allowing both `FACULTY` and `STUDENT` to view reports, while reserving report overriding/reviews strictly for `FACULTY`).

### 2. `FeignClientInterceptor.java`
- Forwards the client's Bearer JWT across outgoing Feign calls to `ai-analysis-service` and `notification-service`.
