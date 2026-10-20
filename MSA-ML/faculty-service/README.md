# Faculty Service

## 1. Service Name
`faculty-service`

## 2. Purpose
Manages faculty profiles and course assignments within the IntegrityAI platform.

## 3. Responsibilities
- Create and retrieve faculty profiles (linked to auth-service users)
- Full CRUD for assignments (create, read, update, delete)
- Verify user existence via auth-service using OpenFeign
- Serve assignment data to submission-service via OpenFeign

## 4. Technology Stack
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1 |
| Spring Cloud | 2025.1.3 |
| Spring Data JPA | (via Spring Boot) |
| Spring Security | (via Spring Boot) |
| Spring Cloud OpenFeign | (via Spring Cloud) |
| PostgreSQL Driver | (via Spring Boot) |
| SpringDoc OpenAPI | 3.1.0 |
| Spring Boot Actuator | (via Spring Boot) |

## 5. Port
`8082`

## 6. Database
**PostgreSQL**
- Database name: `integrityai_faculty`
- Default connection: `localhost:5432`

## 7. Architecture
```
FacultyController     → FacultyService     → FacultyRepository (JPA → PostgreSQL)
AssignmentController  → AssignmentService  → AssignmentRepository (JPA → PostgreSQL)
AuthClient (Feign)    → auth-service:8081  (user validation)
GlobalExceptionHandler
SecurityConfig (all endpoints open for internal service communication)
```

## 8. Important Dependencies
```xml
spring-boot-starter-webmvc
spring-boot-starter-security
spring-boot-starter-data-jpa
spring-boot-starter-validation
spring-boot-starter-actuator
spring-cloud-starter-openfeign
postgresql
springdoc-openapi-starter-webmvc-ui (3.1.0)
```

## 9. API Endpoints

### Faculty
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/faculty` | Create faculty profile |
| GET | `/api/faculty` | Get all faculty |
| GET | `/api/faculty/{facultyId}` | Get faculty by ID |

### Assignments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/assignments` | Create assignment |
| GET | `/api/assignments` | Get all assignments |
| GET | `/api/assignments/{assignmentId}` | Get assignment by ID |
| GET | `/api/assignments/faculty/{facultyId}` | Get assignments by faculty |
| PUT | `/api/assignments/{assignmentId}` | Update assignment |
| DELETE | `/api/assignments/{assignmentId}` | Delete assignment |

### Monitoring
| Method | Endpoint | Description |
|---|---|---|
| GET | `/actuator/health` | Health check |
| GET | `/actuator/info` | App info |

## 10. How to Run

### Prerequisites
- Java 17
- PostgreSQL running on port 5432
- Databases created:

```sql
CREATE DATABASE integrityai_faculty;
```

- auth-service running on port 8081 (for Feign client)

### Start
```bash
./mvnw spring-boot:run
```

## 11. Configuration

| Property | Env Variable | Default |
|---|---|---|
| DB URL | `DB_URL` | `jdbc:postgresql://localhost:5432/integrityai_faculty` |
| DB Username | `DB_USERNAME` | `postgres` |
| DB Password | `DB_PASSWORD` | `root` |
| Auth Service URL | `AUTH_SERVICE_URL` | `http://localhost:8081` |

## 12. Swagger URL
```
http://localhost:8082/swagger-ui.html
http://localhost:8082/v3/api-docs
```

## 13. Actuator URLs
```
http://localhost:8082/actuator/health
http://localhost:8082/actuator/info
```

## 14. Service Communication
- **Consumes**: auth-service `GET /api/users/{userId}` via OpenFeign
- **Consumed by**: submission-service `GET /api/assignments/{assignmentId}` via OpenFeign
- No Maven dependency on other microservices — HTTP only

## 15. Example Requests

### Create Faculty Profile
```json
POST /api/faculty
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "department": "Computer Science",
  "designation": "Associate Professor"
}
```

### Create Assignment
```json
POST /api/assignments
{
  "facultyId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Research Paper on AI Ethics",
  "description": "Write a 5-page paper on ethical implications of AI",
  "subject": "CS501",
  "deadline": "2026-12-31T23:59:59"
}
```

## 16. Testing Instructions
```bash
./mvnw clean test
./mvnw spring-boot:run
curl http://localhost:8082/actuator/health
```
