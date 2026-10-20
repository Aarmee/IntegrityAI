# Config Server

## 1. Service Name
`config-server`

## 2. Purpose
Centralised configuration management for the IntegrityAI microservices platform.

## 3. Responsibilities
- Serve configuration properties to microservices on startup
- Use native filesystem backend (classpath-based, no external Git repo needed)
- Provide a safe place to manage non-secret defaults centrally
- Secrets must always be passed via environment variables — never stored here

## 4. Technology Stack
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1 |
| Spring Cloud | 2025.1.3 |
| Spring Cloud Config Server | (via Spring Cloud) |
| Spring Boot Actuator | (via Spring Boot) |

## 5. Port
`8888`

## 6. Database
None.

## 7. Architecture
```
Config Server :8888 (native profile)
    └── classpath:/config/
            ├── application.properties         ← global defaults
            ├── auth-service.properties
            ├── faculty-service.properties
            ├── submission-service.properties
            ├── notification-service.properties
            └── report-service.properties
```

## 8. Important Dependencies
```xml
spring-cloud-config-server
spring-boot-starter-actuator
```

## 9. Config Endpoints

| Endpoint | Description |
|---|---|
| `GET /{service-name}/default` | Get config for a service |
| `GET /actuator/health` | Health check |
| `GET /actuator/info` | App info |

Examples:
```
http://localhost:8888/auth-service/default
http://localhost:8888/faculty-service/default
http://localhost:8888/submission-service/default
```

## 10. How to Run

### Prerequisites
- Java 17
- Start **before** services that consume config

```bash
./mvnw spring-boot:run
```

## 11. Configuration

| Property | Value |
|---|---|
| Profile | `native` (classpath filesystem) |
| Config location | `classpath:/config` |
| Port | `8888` |

## 12. Security Notes
- Config files in `classpath:/config/` must NOT contain secrets
- Database passwords, JWT secrets, and API keys must be injected via environment variables
- Each service still reads secrets from its own env vars — config server provides non-sensitive defaults only

## 13. Actuator URLs
```
http://localhost:8888/actuator/health
http://localhost:8888/actuator/info
```

## 14. Consuming Config in a Service (optional integration)
Add to a service's `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

And `application.properties`:
```properties
spring.config.import=optional:configserver:http://localhost:8888
```

Services currently work standalone with their own `application.properties` — Config Server integration is additive and optional.

## 15. Testing Instructions
```bash
./mvnw clean test
./mvnw spring-boot:run
curl http://localhost:8888/actuator/health
curl http://localhost:8888/auth-service/default
```
