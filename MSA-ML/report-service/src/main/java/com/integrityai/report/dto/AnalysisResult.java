package com.integrityai.report.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO that mirrors the response from ai-analysis-service POST /api/analysis.
 * Field names use snake_case to match the Python FastAPI response.
 * Jackson maps them automatically via @JsonProperty.
 */
public class AnalysisResult {

    @JsonProperty("analysis_id")
    private String analysisId;

    @JsonProperty("submission_id")
    private String submissionId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("plagiarism_score")
    private Double plagiarismScore;

    @JsonProperty("ai_detection_score")
    private Double aiDetectionScore;

    @JsonProperty("similarity_score")
    private Double similarityScore;

    @JsonProperty("ai_generated_score")
    private Double aiGeneratedScore;

    @JsonProperty("is_plagiarism_flagged")
    private Boolean isPlagiarismFlagged;

    @JsonProperty("is_ai_generated_flagged")
    private Boolean isAiGeneratedFlagged;

    @JsonProperty("risk_score")
    private String riskScore;

    @JsonProperty("text_similarity_pct")
    private Double textSimilarityPct;

    @JsonProperty("ai_probability_pct")
    private Double aiProbabilityPct;

    @JsonProperty("code_similarity_pct")
    private Double codeSimilarityPct;

    @JsonProperty("summary")
    private String summary;

    @JsonProperty("raw_result")
    private String rawResult;

    @JsonProperty("error_message")
    private String errorMessage;

    public AnalysisResult() {}

    public String getRiskScore() { return riskScore != null ? riskScore : "Low"; }
    public void setRiskScore(String riskScore) { this.riskScore = riskScore; }

    public Double getTextSimilarityPct() { return textSimilarityPct; }
    public void setTextSimilarityPct(Double textSimilarityPct) { this.textSimilarityPct = textSimilarityPct; }

    public Double getAiProbabilityPct() { return aiProbabilityPct; }
    public void setAiProbabilityPct(Double aiProbabilityPct) { this.aiProbabilityPct = aiProbabilityPct; }

    public Double getCodeSimilarityPct() { return codeSimilarityPct; }
    public void setCodeSimilarityPct(Double codeSimilarityPct) { this.codeSimilarityPct = codeSimilarityPct; }

    // Plagiarism score — uses plagiarism_score alias if present, else similarity_score
    public Double getPlagiarismScore() {
        return plagiarismScore != null ? plagiarismScore : similarityScore;
    }
    public void setPlagiarismScore(Double plagiarismScore) { this.plagiarismScore = plagiarismScore; }

    // AI detection score — uses ai_detection_score alias if present, else ai_generated_score
    public Double getAiDetectionScore() {
        return aiDetectionScore != null ? aiDetectionScore : aiGeneratedScore;
    }
    public void setAiDetectionScore(Double aiDetectionScore) { this.aiDetectionScore = aiDetectionScore; }

    public String getAnalysisId() { return analysisId; }
    public void setAnalysisId(String analysisId) { this.analysisId = analysisId; }

    public String getSubmissionId() { return submissionId; }
    public void setSubmissionId(String submissionId) { this.submissionId = submissionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }

    public Double getAiGeneratedScore() { return aiGeneratedScore; }
    public void setAiGeneratedScore(Double aiGeneratedScore) { this.aiGeneratedScore = aiGeneratedScore; }

    public Boolean getIsPlagiarismFlagged() { return isPlagiarismFlagged; }
    public void setIsPlagiarismFlagged(Boolean isPlagiarismFlagged) { this.isPlagiarismFlagged = isPlagiarismFlagged; }

    public Boolean getIsAiGeneratedFlagged() { return isAiGeneratedFlagged; }
    public void setIsAiGeneratedFlagged(Boolean isAiGeneratedFlagged) { this.isAiGeneratedFlagged = isAiGeneratedFlagged; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getRawResult() { return rawResult; }
    public void setRawResult(String rawResult) { this.rawResult = rawResult; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
