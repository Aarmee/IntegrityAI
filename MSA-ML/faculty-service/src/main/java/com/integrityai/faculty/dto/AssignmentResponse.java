package com.integrityai.faculty.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class AssignmentResponse {

    private UUID assignmentId;
    private UUID facultyId;
    private String title;
    private String description;
    private String subject;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;

    public AssignmentResponse(
            UUID assignmentId,
            UUID facultyId,
            String title,
            String description,
            String subject,
            LocalDateTime deadline,
            LocalDateTime createdAt) {

        this.assignmentId = assignmentId;
        this.facultyId = facultyId;
        this.title = title;
        this.description = description;
        this.subject = subject;
        this.deadline = deadline;
        this.createdAt = createdAt;
    }

    public UUID getAssignmentId() {
        return assignmentId;
    }

    public UUID getFacultyId() {
        return facultyId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getSubject() {
        return subject;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}