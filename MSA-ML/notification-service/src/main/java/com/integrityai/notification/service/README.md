# Notification Service — Service Layer

## 🎯 Purpose of this Package
Handles notification creation, in-app inbox management, and automated external email dispatch using the **Resend API**.

---

## 📄 Files in this Package

### 1. `NotificationService.java`
- **Why it is used**: Manages notification lifecycle: saves in-app alerts to PostgreSQL, triggers external email dispatch via `EmailService`, and marks messages as read.

### 2. `EmailService.java`
- **Why it is used**: Modern HTTP-based email delivery service integrated with **Resend API**.
- **Key Code & Features**:
  - Uses `RestTemplate` / HTTP POST to `https://api.resend.com/emails`.
  - Formats rich HTML academic emails for:
    - Account Welcome & Onboarding
    - Submission Receipts with timestamp and file checksum
    - Plagiarism & AI content alerts to professors when submissions exceed similarity limits
  - Includes local development mock fallback if no Resend API key is present, preventing crashes during offline grading demos.
