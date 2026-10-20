package com.integrityai.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =============================================
    // Validation errors (400)
    // =============================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

        String firstFriendlyMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .filter(msg -> msg != null && !msg.isBlank())
                .findFirst()
                .orElse("Please verify the required information in the form.");

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 400);
        body.put("error", "Validation Failed");
        body.put("message", firstFriendlyMessage);
        body.put("details", fieldErrors);

        return ResponseEntity.badRequest().body(body);
    }

    // =============================================
    // Data Integrity / Database errors (400)
    // =============================================

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(
            org.springframework.dao.DataIntegrityViolationException ex) {

        String friendlyMessage = "The submitted information could not be saved. Please review your details and try again.";
        String raw = ex.getMessage();
        if (raw != null) {
            if (raw.contains("value too long") || raw.contains("character varying")) {
                friendlyMessage = "One or more of your inputs (such as courses or semesters) exceeded the allowed length. Please shorten your selection.";
            } else if (raw.contains("duplicate key") || raw.contains("users_email_key")) {
                friendlyMessage = "An account with this email address already exists. Please log in or use a different email.";
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 400);
        body.put("error", "Invalid Data");
        body.put("message", friendlyMessage);

        return ResponseEntity.badRequest().body(body);
    }

    // =============================================
    // Conflict errors (409) — email already exists
    // =============================================

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(
            IllegalStateException ex) {

        String message = ex.getMessage();
        if (message != null && message.contains("already")) {
            message = "An account with this email address already exists. Please log in or use a different email.";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 409);
        body.put("error", "Conflict");
        body.put("message", message);

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // =============================================
    // Not Found / Auth errors (404/401)
    // =============================================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(
            RuntimeException ex) {

        String message = ex.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (message != null) {
            if (message.contains("not found") || message.contains("Not found")) {
                status = HttpStatus.NOT_FOUND;
                message = "The requested account or profile could not be found.";
            } else if (message.contains("Invalid email or password")) {
                status = HttpStatus.UNAUTHORIZED;
                message = "Invalid email or password. Please verify your credentials and try again.";
            } else if (message.contains("already registered") || message.contains("already exists")) {
                status = HttpStatus.CONFLICT;
                message = "An account with this email address already exists. Please log in or use a different email.";
            } else if (message.contains("value too long")) {
                message = "One or more of your inputs exceeded the allowed length. Please shorten your selection.";
            }
        } else {
            message = "We could not process your request. Please check your information and try again.";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);

        return ResponseEntity.status(status).body(body);
    }

    /**
     * Catch-all for infrastructure errors (DB connection, JPA, etc.)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {

        String friendlyMessage = "A server error occurred while processing your request. Please try again shortly.";
        if (ex.getMessage() != null && (ex.getMessage().contains("value too long") || ex.getMessage().contains("character varying"))) {
            friendlyMessage = "One or more of your inputs exceeded the allowed length. Please shorten your selection.";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 500);
        body.put("error", "Internal Server Error");
        body.put("message", friendlyMessage);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
