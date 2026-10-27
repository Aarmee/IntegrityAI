# Notification Service — DTO (Data Transfer Object) Layer

## 🎯 Purpose of this Package
Contracts for notification dispatch requests and user inbox representations.

---

## 📄 Files in this Package

### 1. `NotificationRequest.java`
- **Why it is used**: Encapsulates incoming notification payloads sent by other microservices.
- **Fields**:
  - `recipientId`: Target user UUID.
  - `recipientEmail`: Email address for automated SMTP/Resend delivery.
  - `title`, `message`: Notification summary and body.
  - `type`: Enum indicating notification kind (`ACCOUNT_CREATED`, `SUBMISSION_CONFIRMATION`, `PLAGIARISM_ALERT`, `DEADLINE_REMINDER`).

### 2. `NotificationResponse.java`
- **Why it is used**: Output DTO returned when the frontend queries `/api/notifications/user/{id}` to display the notification bell dropdown and read status.
