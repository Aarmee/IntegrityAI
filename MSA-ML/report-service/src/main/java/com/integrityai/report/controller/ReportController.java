package com.integrityai.report.controller;

import com.integrityai.report.dto.ReportRequest;
import com.integrityai.report.dto.ReportResponse;
import com.integrityai.report.dto.ReviewRequest;
import com.integrityai.report.service.ReportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Academic integrity report APIs")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // GENERATE REPORT (calls ai-analysis-service)
    @PostMapping
    @Operation(summary = "Generate an integrity report for a submission")
    public ResponseEntity<ReportResponse> generate(
            @Valid @RequestBody ReportRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(reportService.generateReport(request));
    }

    // GET ALL
    @GetMapping
    @Operation(summary = "Get all reports")
    public ResponseEntity<List<ReportResponse>> getAll() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    // GET BY ID
    @GetMapping("/{reportId}")
    @Operation(summary = "Get report by ID")
    public ResponseEntity<ReportResponse> getById(@PathVariable UUID reportId) {
        return ResponseEntity.ok(reportService.getReportById(reportId));
    }

    // GET BY SUBMISSION
    @GetMapping("/submission/{submissionId}")
    @Operation(summary = "Get report by submission ID")
    public ResponseEntity<ReportResponse> getBySubmission(
            @PathVariable UUID submissionId) {
        return ResponseEntity.ok(reportService.getReportBySubmission(submissionId));
    }

    // GET BY STUDENT
    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get all reports for a student")
    public ResponseEntity<List<ReportResponse>> getByStudent(
            @PathVariable UUID studentId) {
        return ResponseEntity.ok(reportService.getReportsByStudent(studentId));
    }

    // GET BY ASSIGNMENT
    @GetMapping("/assignment/{assignmentId}")
    @Operation(summary = "Get all reports for an assignment")
    public ResponseEntity<List<ReportResponse>> getByAssignment(
            @PathVariable UUID assignmentId) {
        return ResponseEntity.ok(reportService.getReportsByAssignment(assignmentId));
    }

    // DELETE
    @DeleteMapping("/{reportId}")
    @Operation(summary = "Delete a report")
    public ResponseEntity<Void> delete(@PathVariable UUID reportId) {
        reportService.deleteReport(reportId);
        return ResponseEntity.noContent().build();
    }

    // REVIEW REPORT (FACULTY)
    @PutMapping("/{reportId}/review")
    @Operation(summary = "Review report: add faculty remarks and decision (Approved/Rejected)")
    public ResponseEntity<ReportResponse> review(
            @PathVariable UUID reportId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(
                reportService.reviewReport(reportId, request.getFacultyRemarks(), request.getDecision())
        );
    }
}
