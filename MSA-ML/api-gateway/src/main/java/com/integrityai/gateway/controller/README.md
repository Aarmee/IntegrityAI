# API Gateway — Controller Layer

## 🎯 Purpose of this Package
This package represents the **Presentation Layer** for the API Gateway. In Spring Cloud Gateway, most incoming HTTP traffic is dynamically forwarded via declarative route predicates defined in `application.properties`. However, the Gateway also hosts local diagnostic and fallback REST endpoints.

---

## 📄 Files in this Package

### `GatewayHomeController.java`
- **Why it is used**: Provides health and root status responses directly from the Gateway without forwarding the request to downstream services.
- **Key Code & Annotations**:
  - `@RestController`: Marks this class as a Spring REST Controller where every method returns JSON or plain text.
  - `@GetMapping("/")`: Root endpoint returning the API Gateway version, health status, and available microservice route prefixes.
  - `@GetMapping("/health")`: Custom lightweight health status endpoint returning HTTP 200 with runtime diagnostics.
- **Data Flow**:
  - **Inbound**: Client (Browser or Load Balancer) sends `GET /` or `GET /health` to port `8080`.
  - **Processing**: The Gateway intercepts the path before evaluating route predicates.
  - **Outbound**: Returns a JSON object with `{ "service": "api-gateway", "status": "UP" }` immediately.
