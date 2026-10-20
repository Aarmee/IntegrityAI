package com.integrityai.submission.dto;

/**
 * Request sent to ai-analysis-service to trigger analysis.
 * Mirrors the AnalysisRequest schema in the Python service.
 */
public class AnalysisRequest {

    private String submission_id;
    private String student_id;
    private String assignment_id;
    private String text_content;
    private String file_path;

    public AnalysisRequest() {}

    public AnalysisRequest(String submissionId, String textContent, String filePath) {
        this(submissionId, textContent, filePath, null, null);
    }

    public AnalysisRequest(String submissionId, String textContent, String filePath, String studentId, String assignmentId) {
        this.submission_id = submissionId;
        this.text_content = textContent;
        this.file_path = filePath;
        this.student_id = studentId;
        this.assignment_id = assignmentId;
    }

    public String getSubmission_id() { return submission_id; }
    public void setSubmission_id(String submission_id) { this.submission_id = submission_id; }

    public String getStudent_id() { return student_id; }
    public void setStudent_id(String student_id) { this.student_id = student_id; }

    public String getAssignment_id() { return assignment_id; }
    public void setAssignment_id(String assignment_id) { this.assignment_id = assignment_id; }

    public String getText_content() { return text_content; }
    public void setText_content(String text_content) { this.text_content = text_content; }

    public String getFile_path() { return file_path; }
    public void setFile_path(String file_path) { this.file_path = file_path; }
}
