# Notification Service — Exception Handling Layer

## 🎯 Purpose of this Package
Centralized REST exception handler for notification failures and invalid requests.

---

## 📄 Files in this Package

### `GlobalExceptionHandler.java`
- Intercepts uncaught exceptions in notification controllers and serializes clean HTTP error JSON (`400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
