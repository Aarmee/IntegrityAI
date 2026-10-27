# Notification Service — Controller Layer

## 🎯 Purpose of this Package
Exposes REST endpoints under `/api/notifications` to send real-time alerts, stream notifications for a user, and mark notifications as read.

---

## 📄 Files in this Package

### `NotificationController.java`
- **Why it is used**: Handles in-app and email alert management.
- **Key Endpoints & Annotations**:
  - `@PostMapping`: Dispatches a new notification (called by `submission-service`, `auth-service`, or `faculty-service`).
  - `@GetMapping("/user/{userId}")`: Returns in-app notification inbox for a user.
  - `@PatchMapping("/{id}/read")`: Marks a specific notification as read.
  - `@PatchMapping("/user/{userId}/read-all")`: Marks all unread notifications as read.
