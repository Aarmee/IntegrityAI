# Report Service

## 1. Service Name
`report-service`

## 2. Purpose
Generates and manages academic integrity reports by orchestrating analysis through the ai-analysis-service.

## 3. Responsibilities
- Accept report generation requests for submissions
- Call ai-analysis-service via OpenFeign to get plagiarism and AI detection scores
- Store reports in MongoDB with status tracking (PENDING → PROCESSING → COMPLETED/FAILED)
- Provide report retrieval by report ID, submission, student, or assignment
- Handle ai-analysis-service failures gracefully (stores FAILED status with reason)

## 4. Technology Stack
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1 |
| Spring Cloud | 2025.1.3 |
| Spring Data MongoDB | (via Spring Boot) |
| Spring Cloud OpenFeign | (via Spring Cloud) |
| SpringDoc OpenAPI | 3.1.0 |
| Spring Boot Actuator | (via Spring Boot) |

## 5. Port
`8085`

## 6. Database
**MongoDB Atlas** — database `integrityai_reports`, collection `reports`

## 7. Architecture
```
ReportController
    └── ReportService
            ├── ReportRepository (MongoDB)
            └── AiAnalysisClient (Feign → ai-analysis-service:8090)
GlobalExceptionHandler
MongoConfig (UUID: STANDARD)
```

## 8. Report Fields

| Field | Type | Description |
|---|---|---|
| `reportId` | UUID | Auto-generated |
| `submissionId` | UUID | Linked submission |
| `studentId` | UUID | Student who submitted |
| `assignmentId` | UUID | Assignment covered |
| `status` | Enum | PENDING / PROCESSING / COMPLETED / FAILED |
| `plagiarismScore` | Double | 0–100, from AI service |
| `aiDetectionScore` | Double | 0–100, from AI service |
| `summary` | String | Human-readable findings |
| `generatedAt` | LocalDateTime | Creation timestamp |

## 9. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reports` | Generate a new report |
| GET | `/api/reports` | Get all reports |
| GET | `/api/reports/{reportId}` | Get by report ID |
| GET | `/api/reports/submission/{submissionId}` | Get by submission |
| GET | `/api/reports/student/{studentId}` | Get all for student |
| GET | `/api/reports/assignment/{assignmentId}` | Get all for assignment |
| DELETE | `/api/reports/{reportId}` | Delete a report |

### Monitoring
| GET | `/actuator/health` | Health check |
| GET | `/actuator/info` | App info |

## 10. How to Run
```bash
./mvnw spring-boot:run
```

## 11. Configuration

| Property | Env Variable | Default |
|---|---|---|
| MongoDB URI | `MONGODB_URI` | Atlas URI (see application.properties) |
| MongoDB DB | `MONGODB_DATABASE` | `integrityai_reports` |
| AI Analysis URL | `AI_ANALYSIS_SERVICE_URL` | `http://localhost:8090` |

## 12. Swagger URL
```
http://localhost:8085/swagger-ui.html
```

## 13. Actuator URLs
```
http://localhost:8085/actuator/health
http://localhost:8085/actuator/info
```

## 14. Service Communication
- **Consumes**: ai-analysis-service `POST /analysis/analyse` via OpenFeign
- No Maven dependency on any other microservice

## 15. Example Request
```json
POST /api/reports
{
  "submissionId": "550e8400-e29b-41d4-a716-446655440001",
  "studentId":    "550e8400-e29b-41d4-a716-446655440002",
  "assignmentId": "550e8400-e29b-41d4-a716-446655440003",
  "textContent":  "The impact of artificial intelligence on modern education..."
}
```

## 16. Testing
```bash
./mvnw clean test
./mvnw spring-boot:run
curl http://localhost:8085/actuator/health
curl http://localhost:8085/api/reports
```
