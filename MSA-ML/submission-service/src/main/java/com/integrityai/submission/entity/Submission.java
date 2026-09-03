package com.integrityai.submission.entity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "submissions")
public class Submission {

    @Id
    private UUID submissionId;

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Assignment ID is required")
    private UUID assignmentId;

    @NotNull(message = "File type is required")
    private FileType fileType;

    @Size(max = 500, message = "File URL cannot exceed 500 characters")
    private String fileUrl;

    private SubmissionStatus status;

    private LocalDateTime submittedAt;

    public Submission() {
    }

    public Submission(UUID submissionId,
                      UUID studentId,
                      UUID assignmentId,
                      FileType fileType,
                      String fileUrl,
                      SubmissionStatus status,
                      LocalDateTime submittedAt) {

        this.submissionId = submissionId;
        this.studentId = studentId;
        this.assignmentId = assignmentId;
        this.fileType = fileType;
        this.fileUrl = fileUrl;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    public UUID getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(UUID submissionId) {
        this.submissionId = submissionId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public UUID getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(UUID assignmentId) {
        this.assignmentId = assignmentId;
    }

    public FileType getFileType() {
        return fileType;
    }

    public void setFileType(FileType fileType) {
        this.fileType = fileType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}