package com.integrityai.notification.dto;

import com.integrityai.notification.entity.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationResponse {

    private UUID notificationId;
    private UUID recipientId;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private String recipientEmail;
    private Boolean emailSent;
    private LocalDateTime createdAt;

    public NotificationResponse() {}

    public NotificationResponse(UUID notificationId, UUID recipientId,
                                NotificationType type, String title,
                                String message, boolean read,
                                LocalDateTime createdAt) {
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.read = read;
        this.createdAt = createdAt;
    }

    public NotificationResponse(UUID notificationId, UUID recipientId,
                                NotificationType type, String title,
                                String message, boolean read,
                                String recipientEmail, Boolean emailSent,
                                LocalDateTime createdAt) {
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.read = read;
        this.recipientEmail = recipientEmail;
        this.emailSent = emailSent;
        this.createdAt = createdAt;
    }

    public UUID getNotificationId() { return notificationId; }
    public UUID getRecipientId() { return recipientId; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public String getRecipientEmail() { return recipientEmail; }
    public Boolean getEmailSent() { return emailSent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
