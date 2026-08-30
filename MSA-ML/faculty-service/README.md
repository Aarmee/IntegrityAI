# Faculty/Assignment Service

## Purpose
Manages faculty-related assignment operations in the IntegrityAI platform.

## Main Responsibilities
- Create assignments
- Update assignments
- View assignments
- Delete assignments
- Set assignment deadlines
- Manage assignment descriptions
- Associate assignments with faculty users

## Technology
- Spring Boot
- Spring Data JPA
- PostgreSQL
- OpenFeign
- Swagger/OpenAPI

## Main Entity

### Assignment
- assignment_id
- faculty_id
- title
- description
- deadline
- created_at

## API Endpoints

### Assignment
- POST `/api/assignments`
- GET `/api/assignments`
- GET `/api/assignments/{id}`
- PUT `/api/assignments/{id}`
- DELETE `/api/assignments/{id}`

## Database
PostgreSQL

## Communication
The service can communicate with the Authentication Service using OpenFeign when faculty/user validation is required.
