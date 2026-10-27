# Faculty Service — Service (Business Logic) Layer

## 🎯 Purpose of this Package
Implements assignment management workflows, threshold validation, and automated deadline reminders.

---

## 📄 Files in this Package

### 1. `AssignmentService.java`
- **Why it is used**: Orchestrates creation, modification, validation, and retrieval of assignments.
- **Key Methods**:
  - `createAssignment()`: Verifies faculty authorization and inserts a new assignment record.
  - `getAssignmentById()`: Retrieves assignment specifications for student upload forms.
  - `deleteAssignment()`: Soft-deletes or removes an assignment if no submissions have occurred.

### 2. `DeadlineReminderScheduler.java`
- **Why it is used**: Automated background cron job that periodically checks upcoming assignment deadlines and publishes reminder notifications to students.
- **Key Code & Annotations**:
  - `@Scheduled(cron = "0 0 * * * *")`: Executes hourly.
  - Scans for assignments due within 24 hours and dispatches alerts via `notification-service`.

### 3. `FacultyService.java`
- **Why it is used**: Manages faculty onboarding and department profile updates.
