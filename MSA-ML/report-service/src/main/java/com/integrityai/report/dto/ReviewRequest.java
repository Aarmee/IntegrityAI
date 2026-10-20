package com.integrityai.report.dto;

public class ReviewRequest {

    private String facultyRemarks;
    private String decision; // "Approved", "Rejected", "Pending"

    public ReviewRequest() {}

    public ReviewRequest(String facultyRemarks, String decision) {
        this.facultyRemarks = facultyRemarks;
        this.decision = decision;
    }

    public String getFacultyRemarks() { return facultyRemarks; }
    public void setFacultyRemarks(String facultyRemarks) { this.facultyRemarks = facultyRemarks; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
}
