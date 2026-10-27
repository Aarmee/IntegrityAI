# Report Service — Exception Handling Layer

## 🎯 Purpose of this Package
Global exception interceptor translating report errors into standard HTTP error responses.

---

## 📄 Files in this Package

### `GlobalExceptionHandler.java`
- Catches `ResourceNotFoundException`, `IllegalArgumentException`, and unhandled runtime errors, returning standard JSON payloads (`timestamp`, `status`, `error`, `message`, `path`).
