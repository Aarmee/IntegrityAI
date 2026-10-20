package com.integrityai.report.service;

import com.integrityai.report.client.AiAnalysisClient;
import com.integrityai.report.client.NotificationClient;
import com.integrityai.report.dto.AnalysisResult;
import com.integrityai.report.dto.NotificationRequest;
import com.integrityai.report.dto.ReportRequest;
import com.integrityai.report.dto.ReportResponse;
import com.integrityai.report.entity.Report;
import com.integrityai.report.entity.ReportStatus;
import com.integrityai.report.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final AiAnalysisClient aiAnalysisClient;
    private final NotificationClient notificationClient;

    public ReportService(ReportRepository reportRepository,
                         AiAnalysisClient aiAnalysisClient,
                         NotificationClient notificationClient) {
        this.reportRepository = reportRepository;
        this.aiAnalysisClient = aiAnalysisClient;
        this.notificationClient = notificationClient;
    }

    // =========================
    // GENERATE REPORT
    // =========================

    public ReportResponse generateReport(ReportRequest request) {

        Report report = new Report();
        report.setReportId(UUID.randomUUID());
        report.setSubmissionId(request.getSubmissionId());
        report.setStudentId(request.getStudentId());
        report.setAssignmentId(request.getAssignmentId());
        report.setStatus(ReportStatus.PROCESSING);
        report.setGeneratedAt(LocalDateTime.now());

        reportRepository.save(report);

        try {
            Map<String, String> analysisRequest = new LinkedHashMap<>();
            analysisRequest.put("submission_id", request.getSubmissionId().toString());
            if (request.getStudentId() != null) {
                analysisRequest.put("student_id", request.getStudentId().toString());
            }
            if (request.getAssignmentId() != null) {
                analysisRequest.put("assignment_id", request.getAssignmentId().toString());
            }

            if (request.getTextContent() != null && !request.getTextContent().isBlank()) {
                analysisRequest.put("text_content", request.getTextContent());
            }
            if (request.getFilePath() != null && !request.getFilePath().isBlank()) {
                analysisRequest.put("file_path", request.getFilePath());
            }

            AnalysisResult result = aiAnalysisClient.analyse(analysisRequest);

            if ("FAILED".equals(result.getStatus())) {
                report.setStatus(ReportStatus.FAILED);
                report.setSummary(result.getErrorMessage() != null
                        ? "AI analysis failed: " + result.getErrorMessage()
                        : "AI analysis returned a FAILED status");

                // Notify student — analysis failed
                sendNotification(
                        request.getStudentId(),
                        "GENERAL",
                        "Analysis Failed",
                        "The integrity analysis for your submission could not be completed. Please contact support."
                );
            } else {
                report.setStatus(ReportStatus.COMPLETED);
                report.setPlagiarismScore(result.getPlagiarismScore());
                report.setAiDetectionScore(result.getAiDetectionScore());
                report.setSummary(result.getSummary());
                report.setAnalysisResult(result.getRawResult());

                if (result.getAnalysisId() != null) {
                    try {
                        report.setAnalysisId(UUID.fromString(result.getAnalysisId()));
                    } catch (Exception ignored) {}
                }
                report.setRiskScore(result.getRiskScore() != null ? result.getRiskScore() : "Low");
                report.setCodeSimilarityScore(result.getCodeSimilarityPct());
                report.setDecision("Pending");

                // Notify student — report ready
                sendNotification(
                        request.getStudentId(),
                        "REPORT_READY",
                        "Integrity Report Ready",
                        "Your integrity report for submission " + request.getSubmissionId()
                        + " is ready. Similarity: " + formatScore(result.getPlagiarismScore())
                        + "%, AI-generated: " + formatScore(result.getAiDetectionScore()) + "%."
                );
            }

        } catch (Exception e) {
            report.setStatus(ReportStatus.FAILED);
            report.setSummary("Analysis could not be completed: " + e.getMessage());

            sendNotification(
                    request.getStudentId(),
                    "GENERAL",
                    "Analysis Unavailable",
                    "The analysis service is temporarily unavailable. Your submission has been saved."
            );
        }

        Report saved = reportRepository.save(report);
        return toResponse(saved);
    }

    // =========================
    // GET ALL
    // =========================

    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll().stream().map(this::toResponse).toList();
    }

    // =========================
    // GET BY ID
    // =========================

    public ReportResponse getReportById(UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with ID: " + reportId));
        return toResponse(report);
    }

    // =========================
    // GET BY SUBMISSION
    // =========================

    public ReportResponse getReportBySubmission(UUID submissionId) {
        Report report = reportRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException(
                        "Report not found for submission ID: " + submissionId));
        return toResponse(report);
    }

    // =========================
    // GET BY STUDENT
    // =========================

    public List<ReportResponse> getReportsByStudent(UUID studentId) {
        return reportRepository.findByStudentId(studentId)
                .stream().map(this::toResponse).toList();
    }

    // =========================
    // GET BY ASSIGNMENT
    // =========================

    public List<ReportResponse> getReportsByAssignment(UUID assignmentId) {
        return reportRepository.findByAssignmentId(assignmentId)
                .stream().map(this::toResponse).toList();
    }

    // =========================
    // DELETE
    // =========================

    public void deleteReport(UUID reportId) {
        if (!reportRepository.existsById(reportId)) {
            throw new RuntimeException("Report not found with ID: " + reportId);
        }
        reportRepository.deleteById(reportId);
    }

    // =========================
    // REVIEW REPORT (FACULTY)
    // =========================

    public ReportResponse reviewReport(UUID reportId, String facultyRemarks, String decision) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with ID: " + reportId));

        if (facultyRemarks != null) {
            report.setFacultyRemarks(facultyRemarks);
        }
        if (decision != null && !decision.isBlank()) {
            report.setDecision(decision);
        }

        Report saved = reportRepository.save(report);

        sendNotification(
                saved.getStudentId(),
                "REPORT_READY",
                "Submission " + (decision != null ? decision : "Reviewed"),
                "Your submission report has been reviewed by faculty." +
                (facultyRemarks != null && !facultyRemarks.isBlank() ? " Remarks: " + facultyRemarks : "")
        );

        return toResponse(saved);
    }

    // =========================
    // HELPERS
    // =========================

    private void sendNotification(UUID recipientId, String type, String title, String message) {
        try {
            notificationClient.createNotification(
                    new NotificationRequest(recipientId, type, title, message)
            );
        } catch (Exception e) {
            System.err.println(
                    "[ReportService] Warning: could not reach notification-service: " + e.getMessage()
            );
        }
    }

    private String formatScore(Double score) {
        return score != null ? String.format("%.1f", score) : "N/A";
    }

    private ReportResponse toResponse(Report r) {
        ReportResponse response = new ReportResponse(
                r.getReportId(),
                r.getSubmissionId(),
                r.getStudentId(),
                r.getAssignmentId(),
                r.getStatus(),
                r.getPlagiarismScore(),
                r.getAiDetectionScore(),
                r.getSummary(),
                r.getGeneratedAt()
        );
        response.setAnalysisResult(r.getAnalysisResult());
        response.setAnalysisId(r.getAnalysisId());
        response.setRiskScore(r.getRiskScore() != null ? r.getRiskScore() : "Low");
        response.setCodeSimilarityScore(r.getCodeSimilarityScore());
        response.setPdfUrl(r.getPdfUrl());
        response.setFacultyRemarks(r.getFacultyRemarks());
        response.setDecision(r.getDecision() != null ? r.getDecision() : "Pending");
        return response;
    }
}
