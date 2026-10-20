package com.integrityai.notification.controller;

import com.integrityai.notification.dto.NotificationRequest;
import com.integrityai.notification.dto.NotificationResponse;
import com.integrityai.notification.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Notification management APIs")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // CREATE
    @PostMapping
    @Operation(summary = "Create a notification")
    public ResponseEntity<NotificationResponse> create(
            @Valid @RequestBody NotificationRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(notificationService.createNotification(request));
    }

    // SEND DEADLINE REMINDER
    @PostMapping("/reminders/send-deadline-reminder")
    @Operation(summary = "Dispatch deadline reminder notification and email")
    public ResponseEntity<NotificationResponse> sendDeadlineReminder(
            @RequestParam UUID studentId,
            @RequestParam(required = false) String studentEmail,
            @RequestParam String assignmentTitle,
            @RequestParam String deadline,
            @RequestParam(required = false) String timeRemaining) {
        return ResponseEntity.ok(
                notificationService.sendDeadlineReminder(studentId, studentEmail, assignmentTitle, deadline, timeRemaining)
        );
    }

    // SEND WELCOME NOTIFICATION & EMAIL
    @PostMapping("/welcome")
    @Operation(summary = "Send welcome notification and email on user registration")
    public ResponseEntity<NotificationResponse> sendWelcome(
            @RequestParam UUID userId,
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam String role,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String rollNumber,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(
                notificationService.sendWelcome(userId, email, name, role, course, semester, rollNumber, department)
        );
    }

    // SEND FACULTY DEADLINE SUMMARY
    @PostMapping("/faculty-summary")
    @Operation(summary = "Send post-deadline submission summary email to faculty")
    public ResponseEntity<NotificationResponse> sendFacultyDeadlineSummary(
            @RequestParam UUID facultyId,
            @RequestParam String facultyEmail,
            @RequestParam(required = false) String facultyName,
            @RequestParam String assignmentTitle,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String semester,
            @RequestParam String deadline,
            @RequestBody String summaryContent) {
        return ResponseEntity.ok(
                notificationService.sendFacultyDeadlineSummary(
                        facultyId, facultyEmail, facultyName, assignmentTitle, course, semester, deadline, summaryContent
                )
        );
    }

    // GET ALL
    @GetMapping
    @Operation(summary = "Get all notifications")
    public ResponseEntity<List<NotificationResponse>> getAll() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // GET BY ID
    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<NotificationResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    // GET BY RECIPIENT
    @GetMapping("/recipient/{recipientId}")
    @Operation(summary = "Get notifications by recipient")
    public ResponseEntity<List<NotificationResponse>> getByRecipient(
            @PathVariable UUID recipientId) {
        return ResponseEntity.ok(notificationService.getByRecipient(recipientId));
    }

    // GET UNREAD BY RECIPIENT
    @GetMapping("/recipient/{recipientId}/unread")
    @Operation(summary = "Get unread notifications for a recipient")
    public ResponseEntity<List<NotificationResponse>> getUnread(
            @PathVariable UUID recipientId) {
        return ResponseEntity.ok(notificationService.getUnreadByRecipient(recipientId));
    }

    // MARK AS READ
    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // DELETE
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
