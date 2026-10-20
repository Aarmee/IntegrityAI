package com.integrityai.submission.dto;

/**
 * Response from ai-analysis-service POST /api/analysis.
 * Only the fields we care about in submission-service are mapped.
 */
public class AnalysisResponse {

    private String analysis_id;
    private String submission_id;
    private String status;

    public AnalysisResponse() {}

    public String getAnalysis_id() { return analysis_id; }
    public void setAnalysis_id(String analysis_id) { this.analysis_id = analysis_id; }

    public String getSubmission_id() { return submission_id; }
    public void setSubmission_id(String submission_id) { this.submission_id = submission_id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
