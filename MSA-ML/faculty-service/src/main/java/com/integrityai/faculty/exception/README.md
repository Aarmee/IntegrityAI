# Faculty Service — Exception Handling Layer

## 🎯 Purpose of this Package
Catches domain exceptions, validation violations, and resource-not-found errors across faculty and assignment endpoints.

---

## 📄 Files in this Package

### `GlobalExceptionHandler.java`
- **Why it is used**: Intercepts unhandled runtime exceptions and translates them into uniform JSON responses.
- **Key Code & Annotations**:
  - `@RestControllerAdvice`: Global Spring interceptor.
  - Catches `ResourceNotFoundException` (when an assignment ID does not exist) and returns HTTP 404.
  - Catches `MethodArgumentNotValidException` (when validation fails) and returns HTTP 400 with detailed field error mappings.
