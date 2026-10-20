package com.integrityai.report;

import com.integrityai.report.client.AiAnalysisClient;
import com.integrityai.report.client.NotificationClient;
import com.integrityai.report.dto.AnalysisResult;
import com.integrityai.report.dto.ReportRequest;
import com.integrityai.report.dto.ReportResponse;
import com.integrityai.report.entity.Report;
import com.integrityai.report.entity.ReportStatus;
import com.integrityai.report.repository.ReportRepository;
import com.integrityai.report.service.ReportService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock private ReportRepository reportRepository;
    @Mock private AiAnalysisClient aiAnalysisClient;
    @Mock private NotificationClient notificationClient;

    @InjectMocks
    private ReportService reportService;

    private Report buildReport(UUID reportId, UUID submissionId, ReportStatus status) {
        Report r = new Report();
        r.setReportId(reportId);
        r.setSubmissionId(submissionId);
        r.setStudentId(UUID.randomUUID());
        r.setAssignmentId(UUID.randomUUID());
        r.setStatus(status);
        r.setGeneratedAt(LocalDateTime.now());
        return r;
    }

    private ReportRequest buildRequest() {
        ReportRequest req = new ReportRequest();
        req.setSubmissionId(UUID.randomUUID());
        req.setStudentId(UUID.randomUUID());
        req.setAssignmentId(UUID.randomUUID());
        req.setTextContent("Sample academic text for testing purposes.");
        return req;
    }

    // =====================================================================
    // GENERATE REPORT — COMPLETED
    // =====================================================================

    @Test
    void generateReport_aiCompleted_returnsCompleted() {
        ReportRequest req = buildRequest();

        AnalysisResult aiResult = new AnalysisResult();
        aiResult.setStatus("COMPLETED");
        aiResult.setPlagiarismScore(15.0);
        aiResult.setAiDetectionScore(22.0);
        aiResult.setSummary("No issues found.");
        aiResult.setRawResult("{}");

        when(aiAnalysisClient.analyse(any())).thenReturn(aiResult);
        when(notificationClient.createNotification(any())).thenReturn(null);

        Report saved = buildReport(UUID.randomUUID(), req.getSubmissionId(), ReportStatus.COMPLETED);
        saved.setPlagiarismScore(15.0);
        saved.setAiDetectionScore(22.0);
        saved.setSummary("No issues found.");

        // First save (PROCESSING), second save (COMPLETED)
        when(reportRepository.save(any())).thenReturn(saved);

        ReportResponse response = reportService.generateReport(req);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(ReportStatus.COMPLETED);
        assertThat(response.getPlagiarismScore()).isEqualTo(15.0);
    }

    // =====================================================================
    // GENERATE REPORT — AI SERVICE RETURNS FAILED
    // =====================================================================

    @Test
    void generateReport_aiReturnsFailed_reportSetToFailed() {
        ReportRequest req = buildRequest();

        AnalysisResult aiResult = new AnalysisResult();
        aiResult.setStatus("FAILED");
        aiResult.setErrorMessage("Model not loaded");

        when(aiAnalysisClient.analyse(any())).thenReturn(aiResult);
        when(notificationClient.createNotification(any())).thenReturn(null);

        Report saved = buildReport(UUID.randomUUID(), req.getSubmissionId(), ReportStatus.FAILED);
        saved.setSummary("AI analysis failed: Model not loaded");
        when(reportRepository.save(any())).thenReturn(saved);

        ReportResponse response = reportService.generateReport(req);

        assertThat(response.getStatus()).isEqualTo(ReportStatus.FAILED);
        assertThat(response.getSummary()).contains("failed");
    }

    // =====================================================================
    // GENERATE REPORT — AI SERVICE UNAVAILABLE (throws)
    // =====================================================================

    @Test
    void generateReport_aiUnavailable_reportSetToFailed() {
        ReportRequest req = buildRequest();

        when(aiAnalysisClient.analyse(any())).thenThrow(new RuntimeException("Connection refused"));
        when(notificationClient.createNotification(any())).thenReturn(null);

        Report saved = buildReport(UUID.randomUUID(), req.getSubmissionId(), ReportStatus.FAILED);
        saved.setSummary("Analysis could not be completed: Connection refused");
        when(reportRepository.save(any())).thenReturn(saved);

        ReportResponse response = reportService.generateReport(req);

        assertThat(response.getStatus()).isEqualTo(ReportStatus.FAILED);
    }

    // =====================================================================
    // GENERATE REPORT — Notification service down (best-effort)
    // =====================================================================

    @Test
    void generateReport_notificationServiceDown_stillCompletes() {
        ReportRequest req = buildRequest();

        AnalysisResult aiResult = new AnalysisResult();
        aiResult.setStatus("COMPLETED");
        aiResult.setPlagiarismScore(5.0);
        aiResult.setAiDetectionScore(10.0);
        aiResult.setSummary("Clean.");

        when(aiAnalysisClient.analyse(any())).thenReturn(aiResult);
        when(notificationClient.createNotification(any())).thenThrow(new RuntimeException("Notification service down"));

        Report saved = buildReport(UUID.randomUUID(), req.getSubmissionId(), ReportStatus.COMPLETED);
        when(reportRepository.save(any())).thenReturn(saved);

        assertThatCode(() -> reportService.generateReport(req)).doesNotThrowAnyException();
    }

    // =====================================================================
    // GET BY ID
    // =====================================================================

    @Test
    void getReportById_found() {
        UUID id = UUID.randomUUID();
        Report r = buildReport(id, UUID.randomUUID(), ReportStatus.COMPLETED);
        when(reportRepository.findById(id)).thenReturn(Optional.of(r));

        ReportResponse response = reportService.getReportById(id);
        assertThat(response.getReportId()).isEqualTo(id);
    }

    @Test
    void getReportById_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(reportRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.getReportById(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    // =====================================================================
    // GET BY SUBMISSION
    // =====================================================================

    @Test
    void getReportBySubmission_found() {
        UUID submissionId = UUID.randomUUID();
        Report r = buildReport(UUID.randomUUID(), submissionId, ReportStatus.COMPLETED);
        when(reportRepository.findBySubmissionId(submissionId)).thenReturn(Optional.of(r));

        ReportResponse response = reportService.getReportBySubmission(submissionId);
        assertThat(response.getSubmissionId()).isEqualTo(submissionId);
    }

    // =====================================================================
    // GET ALL
    // =====================================================================

    @Test
    void getAllReports_returnsList() {
        Report r = buildReport(UUID.randomUUID(), UUID.randomUUID(), ReportStatus.COMPLETED);
        when(reportRepository.findAll()).thenReturn(List.of(r));

        List<ReportResponse> results = reportService.getAllReports();
        assertThat(results).hasSize(1);
    }

    // =====================================================================
    // DELETE
    // =====================================================================

    @Test
    void deleteReport_success() {
        UUID id = UUID.randomUUID();
        when(reportRepository.existsById(id)).thenReturn(true);
        doNothing().when(reportRepository).deleteById(id);

        assertThatCode(() -> reportService.deleteReport(id)).doesNotThrowAnyException();
    }

    @Test
    void deleteReport_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(reportRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> reportService.deleteReport(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }
}
