# API Gateway

## Purpose
Provides a single entry point for clients to access the IntegrityAI microservices.

## Main Responsibilities
- Route client requests to appropriate microservices
- Provide a unified entry point
- Support service discovery through Eureka
- Handle common gateway-level concerns
- Reduce direct exposure of individual services

## Technology
- Spring Boot
- Spring Cloud Gateway
- Eureka Client

## Request Routing

Client
→ API Gateway
→ Appropriate Microservice

Examples:

/api/auth/** → Authentication Service

/api/assignments/** → Faculty Service

/api/submissions/** → Submission Service

/api/analysis/** → AI Analysis Service

/api/reports/** → Report Service

/api/notifications/** → Notification Service
