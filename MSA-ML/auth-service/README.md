# Auth Service

## 1. Service Name
`auth-service`

## 2. Purpose
Handles user registration, authentication, and user retrieval for the IntegrityAI platform.

## 3. Responsibilities
- Register new users (students, faculty, admins)
- Authenticate users and issue JWT tokens
- Provide user lookup by ID (consumed by faculty-service via OpenFeign)
- Password hashing with BCrypt
- JWT generation with configurable secret and expiry

## 4. Technology Stack
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1 |
| Spring Security | (via Spring Boot) |
| Spring Data JPA | (via Spring Boot) |
| PostgreSQL Driver | (via Spring Boot) |
| JJWT | 0.12.6 |
| SpringDoc OpenAPI | 3.1.0 |
| Spring Boot Actuator | (via Spring Boot) |

## 5. Port
`8081`

## 6. Database
**PostgreSQL**
- Database name: `integrityai_auth`
- Default connection: `localhost:5432`
- Configured via environment variables (see Configuration section)

## 7. Architecture
```
AuthController
    └── AuthService
            ├── UserRepository (JPA → PostgreSQL)
            ├── PasswordEncoder (BCrypt)
            └── JwtService (JWT generation)
GlobalExceptionHandler (catches and formats errors)
SecurityConfig (permits auth, swagger, actuator endpoints)
```

## 8. Important Dependencies
```xml
spring-boot-starter-webmvc
spring-boot-starter-security
spring-boot-starter-data-jpa
spring-boot-starter-validation
spring-boot-starter-actuator
postgresql
jjwt-api / jjwt-impl / jjwt-jackson (0.12.6)
springdoc-openapi-starter-webmvc-ui (3.1.0)
```

## 9. API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |

### Users (internal)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/users/{userId}` | Get user by ID | No (internal) |

### Monitoring
| Method | Endpoint | Description |
|---|---|---|
| GET | `/actuator/health` | Health check |
| GET | `/actuator/info` | App info |

## 10. How to Run

### Prerequisites
- Java 17
- PostgreSQL running on port 5432
- Database `integrityai_auth` created

```sql
CREATE DATABASE integrityai_auth;
```

### Start
```bash
./mvnw spring-boot:run
```

Or with environment variables:
```bash
DB_PASSWORD=yourpassword JWT_SECRET=your-256-bit-secret ./mvnw spring-boot:run
```

## 11. Configuration

| Property | Env Variable | Default |
|---|---|---|
| DB URL | `DB_URL` | `jdbc:postgresql://localhost:5432/integrityai_auth` |
| DB Username | `DB_USERNAME` | `postgres` |
| DB Password | `DB_PASSWORD` | `root` |
| JWT Secret | `JWT_SECRET` | built-in default (change in production) |
| JWT Expiry (ms) | — | `86400000` (24 hours) |

> **Security note**: Always set `JWT_SECRET` and `DB_PASSWORD` via environment variables in production. Never commit secrets to version control.

## 12. Swagger URL
```
http://localhost:8081/swagger-ui.html
http://localhost:8081/v3/api-docs
```

## 13. Actuator URLs
```
http://localhost:8081/actuator/health
http://localhost:8081/actuator/info
```

## 14. Service Communication
- auth-service is **consumed by** faculty-service via OpenFeign
- Endpoint used: `GET /api/users/{userId}`

## 15. Example Requests

### Register
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "FACULTY"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGci...",
  "message": "Login successful"
}
```

## 16. Testing Instructions
```bash
# Build and test
./mvnw clean test

# Start the service
./mvnw spring-boot:run

# Health check
curl http://localhost:8081/actuator/health

# Register
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"pass123","role":"STUDENT"}'

# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```
