# Eureka Server

## 1. Service Name
`eureka-server`

## 2. Purpose
Service discovery and registration for the IntegrityAI microservices platform.

## 3. Responsibilities
- Maintain a registry of all running microservice instances
- Allow services to discover each other by name instead of hardcoded URLs
- Provide a visual dashboard of registered services

## 4. Technology Stack
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1 |
| Spring Cloud | 2025.1.3 |
| Spring Cloud Netflix Eureka Server | (via Spring Cloud) |
| Spring Boot Actuator | (via Spring Boot) |

## 5. Port
`8761`

## 6. Database
None — in-memory registry only.

## 7. Architecture
```
Standalone Eureka Server
  ├── Does NOT register itself as a client
  ├── Does NOT fetch registry from other servers
  └── Services register with: http://localhost:8761/eureka/
```

## 8. Important Dependencies
```xml
spring-cloud-starter-netflix-eureka-server
spring-boot-starter-actuator
```

## 9. Endpoints

| Endpoint | Description |
|---|---|
| `http://localhost:8761` | Eureka dashboard (web UI) |
| `/actuator/health` | Health check |
| `/actuator/info` | App info |

## 10. How to Run

### Prerequisites
- Java 17
- Start this **before** any other service that registers with Eureka

```bash
./mvnw spring-boot:run
```

## 11. Configuration

Key properties in `application.properties`:

```properties
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.server.enable-self-preservation=false
```

`enable-self-preservation=false` is suitable for development — set to `true` in production.

## 12. Service Registration

Other services register by adding to their `application.properties`:

```properties
spring.application.name=auth-service
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
```

And dependency:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

## 13. Actuator URLs
```
http://localhost:8761/actuator/health
http://localhost:8761/actuator/info
```

## 14. Testing Instructions
```bash
./mvnw clean test
./mvnw spring-boot:run
# Open browser: http://localhost:8761
curl http://localhost:8761/actuator/health
```
