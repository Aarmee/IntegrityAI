# Notification Service

## 1. Service Name
`notification-service`

## 2. Purpose
Manages in-platform notifications for users of the IntegrityAI system.

## 3. Responsibilities
- Create notifications for any event (submission received, analysis complete, report ready, deadline, general)
- Retrieve notifications by recipient
- Filter unread notifications per recipient
- Mark notifications as read
- Delete notifications

## 4. Technology Stack
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1 |
| Spring Data MongoDB | (via Spring Boot) |
| SpringDoc OpenAPI | 3.1.0 |
| Spring Boot Actuator | (via Spring Boot) |

## 5. Port
`8084`

## 6. Database
**MongoDB Atlas** — database `integrityai_notifications`, collection `notifications`

## 7. Architecture
```
NotificationController
    └── NotificationService
            └── NotificationRepository (MongoDB)
GlobalExceptionHandler
MongoConfig (UUID representation: STANDARD)
```

## 8. Notification Types
`SUBMISSION_RECEIVED`, `ANALYSIS_COMPLETE`, `REPORT_READY`, `ASSIGNMENT_DEADLINE`, `GENERAL`

## 9. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/notifications` | Create a notification |
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/{id}` | Get by ID |
| GET | `/api/notifications/recipient/{recipientId}` | Get all for a recipient |
| GET | `/api/notifications/recipient/{recipientId}/unread` | Get unread for a recipient |
| PATCH | `/api/notifications/{id}/read` | Mark as read |
| DELETE | `/api/notifications/{id}` | Delete |

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
| MongoDB DB | `MONGODB_DATABASE` | `integrityai_notifications` |

## 12. Swagger URL
```
http://localhost:8084/swagger-ui.html
```

## 13. Actuator URLs
```
http://localhost:8084/actuator/health
http://localhost:8084/actuator/info
```

## 14. Example Request
```json
POST /api/notifications
{
  "recipientId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "SUBMISSION_RECEIVED",
  "title": "Submission Received",
  "message": "Your assignment submission has been received and is being processed."
}
```

## 15. Testing
```bash
./mvnw clean test
./mvnw spring-boot:run
curl http://localhost:8084/actuator/health
```
