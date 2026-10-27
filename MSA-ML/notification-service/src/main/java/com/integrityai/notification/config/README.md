# Notification Service — Configuration Layer

## 🎯 Purpose of this Package
Spring Security, JWT Bearer parsing, and database startup migration helpers for `notification-service`.

---

## 📄 Files in this Package

### 1. `SecurityConfig.java` & `JwtAuthFilter.java`
- Configures security perimeter for notification endpoints and parses Bearer tokens.

### 2. `DatabaseSchemaMigrator.java`
- Verifies and applies database schema adjustments to PostgreSQL on application boot.
