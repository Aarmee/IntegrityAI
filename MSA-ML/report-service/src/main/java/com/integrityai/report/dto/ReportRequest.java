package com.integrityai.report.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class ReportRequest {

    @NotNull(message = "Submission ID is required")
    private UUID submissionId;

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Assignment ID is required")
    private UUID assignmentId;

    /** Optional: text content to analyse (used when calling ai-analysis-service directly) */
    private String textContent;

    /** Optional: file path on disk (fallback if textContent is not provided) */
    private String filePath;

    public UUID getSubmissionId() { return submissionId; }
    public void setSubmissionId(UUID submissionId) { this.submissionId = submissionId; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }

    public String getTextContent() { return textContent; }
    public void setTextContent(String textContent) { this.textContent = textContent; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
}
