package com.integrityai.notification.dto;

import com.integrityai.notification.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class NotificationRequest {

    @NotNull(message = "Recipient ID is required")
    private UUID recipientId;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String recipientEmail;

    public NotificationRequest() {}

    public NotificationRequest(UUID recipientId, NotificationType type, String title, String message) {
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    public NotificationRequest(UUID recipientId, NotificationType type, String title, String message, String recipientEmail) {
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.recipientEmail = recipientEmail;
    }

    public UUID getRecipientId() { return recipientId; }
    public void setRecipientId(UUID recipientId) { this.recipientId = recipientId; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
}
