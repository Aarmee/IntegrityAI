package com.integrityai.submission.dto;

import java.util.UUID;

/**
 * Mirrors notification-service's NotificationRequest DTO.
 * Used by submission-service to fire notifications via Feign.
 */
public class NotificationRequest {

    private UUID recipientId;
    private String type;     // NotificationType enum value as string
    private String title;
    private String message;
    private String recipientEmail;

    public NotificationRequest() {}

    public NotificationRequest(UUID recipientId, String type, String title, String message) {
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    public NotificationRequest(UUID recipientId, String type, String title, String message, String recipientEmail) {
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.recipientEmail = recipientEmail;
    }

    public UUID getRecipientId() { return recipientId; }
    public void setRecipientId(UUID recipientId) { this.recipientId = recipientId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
}
