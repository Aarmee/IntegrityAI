package com.integrityai.notification.service;

import com.integrityai.notification.dto.NotificationRequest;
import com.integrityai.notification.dto.NotificationResponse;
import com.integrityai.notification.entity.Notification;
import com.integrityai.notification.entity.NotificationType;
import com.integrityai.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository, EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    // =========================
    // CREATE
    // =========================

    public NotificationResponse createNotification(NotificationRequest request) {

        Notification notification = new Notification();
        notification.setNotificationId(UUID.randomUUID());
        notification.setRecipientId(request.getRecipientId());
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setRead(false);
        notification.setRecipientEmail(request.getRecipientEmail());
        notification.setCreatedAt(LocalDateTime.now());

        // Only send real emails for allowed essential communications:
        // 1. Welcome emails (Students & Faculty upon registration)
        // 2. Urgent Assignment Deadlines (Students pending submission)
        // 3. Faculty Submission Alerts (Student submitted coursework)
        // 4. Faculty Deadline Summary (Roll call of submitted & missing students)
        boolean shouldDispatchEmail = request.getType() == NotificationType.WELCOME ||
                                      request.getType() == NotificationType.ASSIGNMENT_DEADLINE ||
                                      request.getType() == NotificationType.SUBMISSION_RECEIVED ||
                                      request.getType() == NotificationType.FACULTY_DEADLINE_SUMMARY;

        if (shouldDispatchEmail && request.getRecipientEmail() != null && !request.getRecipientEmail().isBlank()) {
            boolean sent = emailService.sendEmail(request.getRecipientEmail(), request.getTitle(), request.getMessage());
            notification.setEmailSent(sent);
        } else {
            notification.setEmailSent(false);
        }

        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    // =========================
    // FACULTY DEADLINE SUMMARY
    // =========================

    public NotificationResponse sendFacultyDeadlineSummary(
            UUID facultyId,
            String facultyEmail,
            String facultyName,
            String assignmentTitle,
            String course,
            String semester,
            String deadlineStr,
            String summaryContent) {

        String title = "📋 Coursework Submission Summary: " + assignmentTitle + " (" + course + " - Sem " + semester + ")";

        NotificationRequest req = new NotificationRequest(
                facultyId,
                NotificationType.FACULTY_DEADLINE_SUMMARY,
                title,
                summaryContent,
                facultyEmail
        );
        return createNotification(req);
    }

    // =========================
    // DEADLINE REMINDER
    // =========================

    public NotificationResponse sendDeadlineReminder(UUID studentId, String studentEmail, String assignmentTitle, String deadlineStr) {
        return sendDeadlineReminder(studentId, studentEmail, assignmentTitle, deadlineStr, null);
    }

    public NotificationResponse sendDeadlineReminder(UUID studentId, String studentEmail, String assignmentTitle, String deadlineStr, String timeRemaining) {
        String remainingText = (timeRemaining != null && !timeRemaining.isBlank())
                ? " (" + timeRemaining + " remaining)"
                : "";

        String title = "⏳ Urgent: Assignment Deadline Approaching" + remainingText;

        StringBuilder sb = new StringBuilder();
        sb.append("This is an urgent reminder that your assignment '")
          .append(assignmentTitle)
          .append("' is due on ")
          .append(deadlineStr);

        if (timeRemaining != null && !timeRemaining.isBlank()) {
            sb.append(".\n\n⚠️ Time Remaining: ").append(timeRemaining);
        } else {
            sb.append(".");
        }

        sb.append("\n\nOur records indicate you have NOT submitted your final work yet.")
          .append("\nPlease log in to IntegrityAI to complete your pre-flight check and submit before the cutoff.")
          .append("\n\nPortal: http://localhost:5173/student/submit")
          .append("\n\nBest regards,\nIntegrityAI Academic Team");

        NotificationRequest req = new NotificationRequest(
                studentId,
                NotificationType.ASSIGNMENT_DEADLINE,
                title,
                sb.toString(),
                studentEmail
        );
        return createNotification(req);
    }

    // =========================
    // WELCOME NOTIFICATION & EMAIL
    // =========================

    public NotificationResponse sendWelcome(UUID userId, String email, String name, String role,
                                            String course, String semester, String rollNumber, String department) {
        boolean isStudent = "STUDENT".equalsIgnoreCase(role);
        String title = isStudent 
                ? "Welcome to IntegrityAI Academic Portal! 🎉" 
                : "Welcome to IntegrityAI Faculty Portal! 🎓";

        StringBuilder sb = new StringBuilder();
        sb.append("Dear ").append(name != null ? name : "User").append(",\n\n");
        sb.append("Welcome to IntegrityAI! Your ").append(role != null ? role.toUpperCase() : "user")
          .append(" account has been successfully registered.\n\n");

        if (isStudent) {
            sb.append("Academic Information:\n");
            if (rollNumber != null && !rollNumber.isBlank()) sb.append("• Student ID / Roll Number: ").append(rollNumber).append("\n");
            if (course != null && !course.isBlank()) sb.append("• Enrolled Program: ").append(course).append("\n");
            if (semester != null && !semester.isBlank()) sb.append("• Current Semester: ").append(semester).append("\n");
            sb.append("\nYou can now view active assignments, run pre-flight integrity scans, and submit your coursework with peace of mind.\n");
        } else {
            sb.append("Faculty Information:\n");
            if (department != null && !department.isBlank()) sb.append("• Department: ").append(department).append("\n");
            if (course != null && !course.isBlank()) sb.append("• Degree Programs: ").append(course).append("\n");
            if (semester != null && !semester.isBlank()) sb.append("• Semesters: ").append(semester).append("\n");
            sb.append("\nYou can now create assignments, review submitted coursework, and inspect detailed sentence-level originality reports.\n");
        }

        sb.append("\nSign in here: http://localhost:5173/login\n\n");
        sb.append("Best regards,\nIntegrityAI Academic Team");

        NotificationRequest req = new NotificationRequest(
                userId,
                NotificationType.WELCOME,
                title,
                sb.toString(),
                email
        );
        return createNotification(req);
    }

    // =========================
    // GET ALL
    // =========================

    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET BY ID
    // =========================

    public NotificationResponse getNotificationById(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Notification not found with ID: " + id));
        return toResponse(notification);
    }

    // =========================
    // GET BY RECIPIENT
    // =========================

    public List<NotificationResponse> getNotificationsByRecipient(UUID recipientId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<NotificationResponse> getByRecipient(UUID recipientId) {
        return getNotificationsByRecipient(recipientId);
    }

    public List<NotificationResponse> getUnreadByRecipient(UUID recipientId) {
        return notificationRepository.findByRecipientIdAndRead(recipientId, false)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // MARK AS READ
    // =========================

    public NotificationResponse markAsRead(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Notification not found with ID: " + id));

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return toResponse(updated);
    }

    // =========================
    // MARK ALL AS READ
    // =========================

    public void markAllAsRead(UUID recipientId) {
        List<Notification> notifications =
                notificationRepository.findByRecipientIdAndRead(recipientId, false);

        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    // =========================
    // DELETE
    // =========================

    public void deleteNotification(UUID id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException(
                    "Notification not found with ID: " + id);
        }
        notificationRepository.deleteById(id);
    }

    // =========================
    // HELPER
    // =========================

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getNotificationId(),
                notification.getRecipientId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getRecipientEmail(),
                notification.getEmailSent(),
                notification.getCreatedAt()
        );
    }
}
