# Authentication Service

## Purpose
Manages user registration, authentication, and role-based access for the IntegrityAI platform.

## Roles
- Student
- Faculty
- Admin

## Technology
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Spring Security
- JWT
- Swagger/OpenAPI

## Main Responsibilities
- User registration
- User login
- Password encryption
- JWT token generation
- Role-based authorization
- User management

## API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`

### User
- GET `/api/users/{id}`
- GET `/api/users`

## Database
PostgreSQL
