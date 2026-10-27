# Notification Service — Repository Layer

## 🎯 Purpose of this Package
Spring Data JPA data access interface for notifications.

---

## 📄 Files in this Package

### `NotificationRepository.java`
- **Why it is used**: Executes queries against the `notifications` PostgreSQL table.
- **Key Methods**:
  - `List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId)`: Fetches user inbox ordered chronologically.
  - `long countByRecipientIdAndIsReadFalse(String recipientId)`: Counts unread notifications to display the badge count on the frontend bell icon.
