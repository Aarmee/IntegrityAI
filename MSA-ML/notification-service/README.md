# Notification Service

## Purpose
Manages notifications for students and faculty based on important events in the IntegrityAI platform.

## Main Responsibilities
- Send submission notifications
- Notify users when analysis is completed
- Notify faculty about new submissions
- Notify students about feedback or report availability
- Maintain notification history
- Manage notification status

## Notification Types
- Assignment submission confirmation
- New submission notification
- Analysis completed notification
- Report generated notification
- Faculty feedback notification

## Technology
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Apache Kafka
- Swagger/OpenAPI

## Main Entity

### Notification
- notification_id
- user_id
- type
- message
- status
- created_at
- read_at

## Notification Status
- SENT
- READ
- FAILED

## API Endpoints

### Notifications
- POST `/api/notifications`
- GET `/api/notifications/user/{userId}`
- GET `/api/notifications/{id}`
- PUT `/api/notifications/{id}/read`

## Database
PostgreSQL

## Communication
The Notification Service consumes events from other services using Apache Kafka and sends appropriate notifications to users.

## Events
Examples of events that can trigger notifications:

- SubmissionCreated
- AnalysisCompleted
- ReportGenerated
- FeedbackAdded
