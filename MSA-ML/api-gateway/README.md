# API Gateway

## 1. Service Name
`api-gateway`

## 2. Purpose
Single entry point for all client requests to the IntegrityAI microservices platform.

## 3. Responsibilities
- Route incoming HTTP requests to the correct downstream microservice
- Load-balance across multiple service instances via Eureka discovery
- Provide a unified external interface hiding internal service topology

## 4. Technology Stack
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1 |
| Spring Cloud | 2025.1.3 |
| Spring Cloud Gateway (MVC) | (via Spring Cloud) |
| Spring Cloud Netflix Eureka Client | (via Spring Cloud) |
| Spring Boot Actuator | (via Spring Boot) |

## 5. Port
`8080`

## 6. Database
None.

## 7. Architecture
```
Client Request
     │
     ▼
API Gateway :8080
     │
     ├── /api/auth/**        → lb://auth-service        :8081
     ├── /api/users/**       → lb://auth-service        :8081
     ├── /api/faculty/**     → lb://faculty-service     :8082
     ├── /api/assignments/** → lb://faculty-service     :8082
     ├── /api/submissions/** → lb://submission-service  :8083
     ├── /api/notifications/**→ lb://notification-service:8084
     └── /api/reports/**     → lb://report-service      :8085
```

`lb://` prefix uses Eureka service discovery + Spring Cloud LoadBalancer.

## 8. Important Dependencies
```xml
spring-cloud-starter-gateway-server-webmvc
spring-cloud-starter-netflix-eureka-client
spring-boot-starter-actuator
```

## 9. Route Configuration

| Route ID | Path Pattern | Target Service |
|---|---|---|
| auth-service-auth | `/api/auth/**` | auth-service |
| auth-service-users | `/api/users/**` | auth-service |
| faculty-service-faculty | `/api/faculty/**` | faculty-service |
| faculty-service-assignments | `/api/assignments/**` | faculty-service |
| submission-service | `/api/submissions/**` | submission-service |
| notification-service | `/api/notifications/**` | notification-service |
| report-service | `/api/reports/**` | report-service |

## 10. How to Run

### Prerequisites
- Java 17
- Eureka Server running on port 8761
- Target microservices running and registered with Eureka

```bash
./mvnw spring-boot:run
```

## 11. Configuration

| Property | Env Variable | Default |
|---|---|---|
| Eureka URI | `EUREKA_URI` | `http://localhost:8761/eureka/` |
| Auth Service URI | `AUTH_SERVICE_URI` | `lb://auth-service` |
| Faculty Service URI | `FACULTY_SERVICE_URI` | `lb://faculty-service` |
| Submission Service URI | `SUBMISSION_SERVICE_URI` | `lb://submission-service` |
| Notification Service URI | `NOTIFICATION_SERVICE_URI` | `lb://notification-service` |
| Report Service URI | `REPORT_SERVICE_URI` | `lb://report-service` |

## 12. Actuator URLs
```
http://localhost:8080/actuator/health
http://localhost:8080/actuator/info
```

## 13. Service Communication
- Registers with Eureka as `api-gateway`
- Routes via `lb://` URIs — Eureka provides instance resolution
- No direct HTTP hardcoded URLs to downstream services

## 14. Startup Order
1. Eureka Server (`:8761`)
2. Auth Service (`:8081`)
3. Faculty Service (`:8082`)
4. Submission Service (`:8083`)
5. Notification Service (`:8084`)
6. Report Service (`:8085`)
7. **API Gateway** (`:8080`) ← last

## 15. Testing
```bash
./mvnw clean test
./mvnw spring-boot:run

# Health check
curl http://localhost:8080/actuator/health

# Route to auth-service (once all services are up)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```
