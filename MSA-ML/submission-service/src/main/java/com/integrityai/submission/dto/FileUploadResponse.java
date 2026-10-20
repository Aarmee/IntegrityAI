package com.integrityai.submission.dto;

import com.integrityai.submission.entity.FileType;
import com.integrityai.submission.entity.SubmissionStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response returned after a successful file upload.
 * Contains the created Submission ID and the stored file path (fileUrl).
 */
public class FileUploadResponse {

    private UUID submissionId;
    private UUID studentId;
    private UUID assignmentId;
    private FileType fileType;
    private String fileUrl;
    private SubmissionStatus status;
    private LocalDateTime submittedAt;
    private String message;

    public FileUploadResponse() {}

    public FileUploadResponse(UUID submissionId,
                               UUID studentId,
                               UUID assignmentId,
                               FileType fileType,
                               String fileUrl,
                               SubmissionStatus status,
                               LocalDateTime submittedAt,
                               String message) {
        this.submissionId = submissionId;
        this.studentId = studentId;
        this.assignmentId = assignmentId;
        this.fileType = fileType;
        this.fileUrl = fileUrl;
        this.status = status;
        this.submittedAt = submittedAt;
        this.message = message;
    }

    public UUID getSubmissionId() { return submissionId; }
    public void setSubmissionId(UUID submissionId) { this.submissionId = submissionId; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }

    public FileType getFileType() { return fileType; }
    public void setFileType(FileType fileType) { this.fileType = fileType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
