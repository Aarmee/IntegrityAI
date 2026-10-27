# Auth Service — Exception Handling Layer

## 🎯 Purpose of this Package
Centralizes error handling for the entire microservice. Rather than allowing raw Java stack traces, SQL exceptions, or Hibernate internal errors to leak to the client, this layer translates exceptions into uniform, human-readable JSON responses.

---

## 📄 Files in this Package

### `GlobalExceptionHandler.java`
- **Why it is used**: Intercepts unhandled exceptions thrown across controllers and formats them into standard HTTP error structures (`timestamp`, `status`, `error`, `message`, `path`).
- **Key Code & Annotations**:
  - `@RestControllerAdvice`: Marks this class as a global interceptor for all `@RestController` exceptions.
  - `@ExceptionHandler(MethodArgumentNotValidException.class)`: Intercepts validation failures triggered by `@Valid` in DTOs and extracts readable error messages for each invalid field.
  - `@ExceptionHandler(DataIntegrityViolationException.class)`: Catches SQL duplicate key errors (e.g. attempting to register with an email that already exists) and converts them into a friendly `409 Conflict` message.
  - `@ExceptionHandler(BadCredentialsException.class)`: Returns `401 Unauthorized` with a clear message: *"Invalid email or password"*.
  - `@ExceptionHandler(Exception.class)`: Fallback safety net returning `500 Internal Server Error` with a sanitized message.
