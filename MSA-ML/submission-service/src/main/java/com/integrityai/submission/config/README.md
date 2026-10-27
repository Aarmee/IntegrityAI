# Submission Service — Configuration Layer

## 🎯 Purpose of this Package
Configures NoSQL **MongoDB Atlas** persistence, **AWS S3** cloud object storage credentials, Spring Security, and OpenFeign inter-service JWT propagation.

---

## 📄 Files in this Package

### 1. `MongoConfig.java`
- **Why it is used**: Configures MongoDB Atlas connectivity, custom converters, and auditing (`@EnableMongoAuditing`).
- **Polyglot Persistence Justification**: Submissions contain semi-structured documents, variable sentence arrays, and analysis metadata. Storing submissions in MongoDB allows dynamic JSON document nesting without rigid relational table migrations.

### 2. `FeignClientInterceptor.java`
- **Why it is used**: Automatically extracts the incoming `Authorization: Bearer <token>` from the HTTP request context and attaches it to all outgoing OpenFeign inter-service calls.
- **Why this is critical for MSA**: Preserves the student/faculty security context across microservice hops without re-authenticating.

### 3. `SecurityConfig.java` & `JwtAuthFilter.java`
- **Why it is used**: Authenticates the incoming JWT token, validates user role (`STUDENT`), and injects user identity into Spring's `SecurityContext`.
