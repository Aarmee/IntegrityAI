package com.integrityai.report.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @Column(name = "report_id")
    private UUID reportId;

    /** ID of the submission this report covers */
    @Column(name = "submission_id", nullable = false)
    private UUID submissionId;

    /** ID of the student who made the submission */
    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    /** ID of the assignment */
    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReportStatus status;

    /** Plagiarism similarity score (0–100) */
    @Column(name = "plagiarism_score")
    private Double plagiarismScore;

    /** AI-generated content probability (0–100) */
    @Column(name = "ai_detection_score")
    private Double aiDetectionScore;

    /** Human-readable summary of findings */
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    /** Raw analysis result JSON from ai-analysis-service (stored as String) */
    @Column(name = "analysis_result", columnDefinition = "TEXT")
    private String analysisResult;

    /** Analysis ID from ai-analysis-service (Synopsis ERD alignment) */
    @Column(name = "analysis_id")
    private UUID analysisId;

    /** Risk Score: Low, Medium, High (Synopsis Section 3 & ERD) */
    @Column(name = "risk_score")
    private String riskScore = "Low";

    /** Code similarity score (0–100) (Synopsis ERD) */
    @Column(name = "code_similarity_score")
    private Double codeSimilarityScore;

    /** Downloadable PDF URL (Synopsis Section 4 & ERD) */
    @Column(name = "pdf_url")
    private String pdfUrl;

    /** Faculty Remarks (Synopsis Section 6 & ERD) */
    @Column(name = "faculty_remarks", columnDefinition = "TEXT")
    private String facultyRemarks;

    /** Faculty Decision: Approved, Rejected, Pending (Synopsis Section 6 & ERD) */
    @Column(name = "decision")
    private String decision = "Pending";

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    public Report() {}

    // ---- Getters & Setters ----

    public UUID getReportId() { return reportId; }
    public void setReportId(UUID reportId) { this.reportId = reportId; }

    public UUID getAnalysisId() { return analysisId; }
    public void setAnalysisId(UUID analysisId) { this.analysisId = analysisId; }

    public String getRiskScore() { return riskScore; }
    public void setRiskScore(String riskScore) { this.riskScore = riskScore; }

    public Double getCodeSimilarityScore() { return codeSimilarityScore; }
    public void setCodeSimilarityScore(Double codeSimilarityScore) { this.codeSimilarityScore = codeSimilarityScore; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getFacultyRemarks() { return facultyRemarks; }
    public void setFacultyRemarks(String facultyRemarks) { this.facultyRemarks = facultyRemarks; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public UUID getSubmissionId() { return submissionId; }
    public void setSubmissionId(UUID submissionId) { this.submissionId = submissionId; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public Double getPlagiarismScore() { return plagiarismScore; }
    public void setPlagiarismScore(Double plagiarismScore) { this.plagiarismScore = plagiarismScore; }

    public Double getAiDetectionScore() { return aiDetectionScore; }
    public void setAiDetectionScore(Double aiDetectionScore) { this.aiDetectionScore = aiDetectionScore; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getAnalysisResult() { return analysisResult; }
    public void setAnalysisResult(String analysisResult) { this.analysisResult = analysisResult; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
