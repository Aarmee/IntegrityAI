# Auth Service — Configuration Layer

## 🎯 Purpose of this Package
Contains application-wide Spring Beans, Security filter chains, password hashing algorithms, and automated database schema migration hooks.

---

## 📄 Files in this Package

### 1. `SecurityConfig.java`
- **Why it is used**: Configures authentication rules for the service and provides the `PasswordEncoder` bean.
- **Key Code & Annotations**:
  - `@Configuration`: Indicates Spring configuration provider.
  - `@Bean PasswordEncoder`: Returns a `BCryptPasswordEncoder()` used across registration and login.
  - `@Bean SecurityFilterChain`: Sets `/api/auth/**`, `/actuator/**`, and `/v3/api-docs/**` as `permitAll()`.

### 2. `DatabaseSchemaMigrator.java`
- **Why it is used**: Automatically handles database schema updates (like adding new columns, roles, or indexes) on service startup to prevent migration crashes across different PostgreSQL versions.
- **Key Code & Annotations**:
  - `@Component`: Registers bean for Spring component scanning.
  - `@EventListener(ApplicationReadyEvent.class)`: Executes safe `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` checks immediately after the DataSource connection initializes.
