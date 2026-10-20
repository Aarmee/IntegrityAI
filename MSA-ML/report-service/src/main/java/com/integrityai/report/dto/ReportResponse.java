package com.integrityai.report.dto;

import com.integrityai.report.entity.ReportStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReportResponse {

    private UUID reportId;
    private UUID submissionId;
    private UUID studentId;
    private UUID assignmentId;
    private ReportStatus status;
    private Double plagiarismScore;
    private Double aiDetectionScore;
    private String summary;
    private String analysisResult;
    private UUID analysisId;
    private String riskScore = "Low";
    private Double codeSimilarityScore;
    private String pdfUrl;
    private String facultyRemarks;
    private String decision = "Pending";
    private LocalDateTime generatedAt;

    public ReportResponse() {}

    public ReportResponse(UUID reportId, UUID submissionId, UUID studentId,
                          UUID assignmentId, ReportStatus status,
                          Double plagiarismScore, Double aiDetectionScore,
                          String summary, LocalDateTime generatedAt) {
        this.reportId = reportId;
        this.submissionId = submissionId;
        this.studentId = studentId;
        this.assignmentId = assignmentId;
        this.status = status;
        this.plagiarismScore = plagiarismScore;
        this.aiDetectionScore = aiDetectionScore;
        this.summary = summary;
        this.generatedAt = generatedAt;
    }

    public UUID getReportId() { return reportId; }
    public UUID getSubmissionId() { return submissionId; }
    public UUID getStudentId() { return studentId; }
    public UUID getAssignmentId() { return assignmentId; }
    public ReportStatus getStatus() { return status; }
    public Double getPlagiarismScore() { return plagiarismScore; }
    public Double getAiDetectionScore() { return aiDetectionScore; }
    public String getSummary() { return summary; }
    public String getAnalysisResult() { return analysisResult; }
    public void setAnalysisResult(String analysisResult) { this.analysisResult = analysisResult; }
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
    public LocalDateTime getGeneratedAt() { return generatedAt; }
}
