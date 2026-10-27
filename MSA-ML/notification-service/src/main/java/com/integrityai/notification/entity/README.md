# Notification Service — Entity (Persistence Model) Layer

## 🎯 Purpose of this Package
Defines JPA models mapped to the `integrityai_notification` PostgreSQL database.

---

## 📄 Files in this Package

### 1. `Notification.java`
- **Why it is used**: Database entity representing the `notifications` table.
- **Key Code & Annotations**:
  - `@Entity @Table(name = "notifications")`: Maps to PostgreSQL.
  - `@Id @GeneratedValue(strategy = GenerationType.UUID)`: Notification unique ID.
  - `recipientId`, `recipientEmail`: Delivery coordinates.
  - `isRead`: Boolean tracking whether the student/faculty has opened the notification.
  - `@Enumerated(EnumType.STRING)`: Stores `NotificationType` string.

### 2. `NotificationType.java`
- **Why it is used**: Enum classifying notification types (`WELCOME`, `SUBMISSION_RECEIPT`, `ANALYSIS_COMPLETE`, `HIGH_SIMILARITY_FLAG`, `DEADLINE_ALERT`).
