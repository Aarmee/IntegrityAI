# Submission Service

## 1. Service Name
`submission-service`

## 2. Purpose
Manages student submission of assignments within the IntegrityAI platform.

## 3. Responsibilities
- Accept and store student file submissions
- Validate assignment existence via faculty-service
- Full CRUD for submissions
- Track submission status (Uploaded → Processing → Done)
- Query submissions by student or assignment

## 4. Technology Stack
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1 |
| Spring Cloud | 2025.1.3 |
| Spring Data MongoDB | (via Spring Boot) |
| Spring Security | (via Spring Boot) |
| Spring Cloud OpenFeign | (via Spring Cloud) |
| SpringDoc OpenAPI | 3.1.0 |
| Spring Boot Actuator | (via Spring Boot) |

## 5. Port
`8083`

## 6. Database
**MongoDB Atlas**
- Database name: `integrityai_submission`
- Collection: `submissions`
- UUID representation: STANDARD
- Connection configured via `MONGODB_URI` environment variable

## 7. Architecture
```
SubmissionController
    └── SubmissionService
            ├── SubmissionRepository (MongoDB Atlas)
            └── FacultyClient (Feign → faculty-service:8082)
GlobalExceptionHandler
SecurityConfig (permits swagger + actuator)
MongoConfig (UUID representation)
```

## 8. Important Dependencies
```xml
spring-boot-starter-webmvc
spring-boot-starter-security
spring-boot-starter-data-mongodb
spring-boot-starter-validation
spring-boot-starter-actuator
spring-cloud-starter-openfeign
springdoc-openapi-starter-webmvc-ui (3.1.0)
```

> **Note**: There is NO Maven dependency on faculty-service or any other microservice JAR.
> All communication is via HTTP/OpenFeign only.

## 9. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/submissions` | Create a submission |
| GET | `/api/submissions` | Get all submissions |
| GET | `/api/submissions/{id}` | Get submission by ID |
| GET | `/api/submissions/student/{studentId}` | Get by student |
| GET | `/api/submissions/assignment/{assignmentId}` | Get by assignment |
| PUT | `/api/submissions/{id}` | Update a submission |
| DELETE | `/api/submissions/{id}` | Delete a submission |

### Monitoring
| Method | Endpoint | Description |
|---|---|---|
| GET | `/actuator/health` | Health check |
| GET | `/actuator/info` | App info |

## 10. How to Run

### Prerequisites
- Java 17
- MongoDB Atlas account (or local MongoDB)
- faculty-service running on port 8082

### Start
```bash
./mvnw spring-boot:run
```

With custom MongoDB URI:
```bash
MONGODB_URI="mongodb+srv://..." ./mvnw spring-boot:run
```

## 11. Configuration

| Property | Env Variable | Default |
|---|---|---|
| MongoDB URI | `MONGODB_URI` | Atlas URI (see application.properties) |
| MongoDB DB | `MONGODB_DATABASE` | `integrityai_submission` |
| Faculty Service URL | `FACULTY_SERVICE_URL` | `http://localhost:8082` |

> **Security note**: In production, set `MONGODB_URI` via environment variable, never commit credentials to source control.

## 12. Swagger URL
```
http://localhost:8083/swagger-ui.html
http://localhost:8083/v3/api-docs
```

## 13. Actuator URLs
```
http://localhost:8083/actuator/health
http://localhost:8083/actuator/info
```

## 14. Service Communication
- **Consumes**: faculty-service `GET /api/assignments/{assignmentId}` via OpenFeign
- **Consumed by**: ai-analysis-service (future)
- No Maven dependency on other microservices — HTTP only

## 15. Submission Entity

| Field | Type | Notes |
|---|---|---|
| `submissionId` | UUID | Auto-generated |
| `studentId` | UUID | Required |
| `assignmentId` | UUID | Required, validated against faculty-service |
| `fileType` | Enum | PDF, DOCX, ZIP, CODE |
| `fileUrl` | String | Max 500 chars |
| `status` | Enum | Uploaded, Processing, Done |
| `submittedAt` | LocalDateTime | Set on creation |

## 16. Testing Instructions
```bash
./mvnw clean test
./mvnw spring-boot:run
curl http://localhost:8083/actuator/health
```

### Example Create Submission
```json
POST /api/submissions
{
  "studentId": "550e8400-e29b-41d4-a716-446655440000",
  "assignmentId": "550e8400-e29b-41d4-a716-446655440001",
  "fileType": "PDF",
  "fileUrl": "https://storage.example.com/submissions/paper.pdf"
}
```
