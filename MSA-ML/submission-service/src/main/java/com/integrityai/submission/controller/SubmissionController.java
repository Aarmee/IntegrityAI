package com.integrityai.submission.controller;

import com.integrityai.submission.dto.FileUploadResponse;
import com.integrityai.submission.entity.Submission;
import com.integrityai.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@Tag(name = "Submission Service", description = "APIs for managing student submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // ============================================================
    // UPLOAD FILE (primary student flow)
    // POST /api/submissions/upload
    // multipart/form-data: file + studentId + assignmentId
    // ============================================================

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a submission file (multipart)")
    public ResponseEntity<FileUploadResponse> uploadSubmission(
            @RequestParam("file")                         MultipartFile file,
            @RequestParam("studentId")                    UUID studentId,
            @RequestParam("assignmentId")                 UUID assignmentId,
            @RequestParam(value = "studentName", required = false) String studentName,
            @RequestParam(value = "rollNumber", required = false)  String rollNumber,
            @RequestParam(value = "course", required = false)      String course,
            @RequestParam(value = "semester", required = false)    String semester,
            @RequestParam(value = "isDraft", defaultValue = "false") Boolean isDraft) {

        Submission saved = submissionService.createSubmissionWithFile(
                studentId, assignmentId, file, studentName, rollNumber, course, semester, isDraft);

        FileUploadResponse response = new FileUploadResponse(
                saved.getSubmissionId(),
                saved.getStudentId(),
                saved.getAssignmentId(),
                saved.getFileType(),
                saved.getFileUrl(),
                saved.getStatus(),
                saved.getSubmittedAt(),
                Boolean.TRUE.equals(isDraft) ? "Draft uploaded successfully for pre-flight scan" : "File uploaded successfully"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm draft submission into official final submission")
    public ResponseEntity<Submission> confirmSubmission(@PathVariable UUID id) {
        return ResponseEntity.ok(submissionService.confirmSubmission(id));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download or stream the uploaded submission file")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable UUID id) {
        SubmissionService.FileDownloadResult result = submissionService.getFileDownload(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(result.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + result.filename() + "\"")
                .body(result.resource());
    }

    // ============================================================
    // CREATE (metadata-only — legacy / internal)
    // ============================================================

    @PostMapping
    @Operation(summary = "Create a submission record (metadata only)")
    public ResponseEntity<Submission> createSubmission(
            @Valid @RequestBody Submission submission) {

        Submission created = submissionService.createSubmission(submission);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET ALL
    @GetMapping
    @Operation(summary = "Get all submissions")
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }

    // GET BY ID
    @GetMapping("/{id}")
    @Operation(summary = "Get submission by ID")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable UUID id) {
        return ResponseEntity.ok(submissionService.getSubmissionById(id));
    }

    // GET BY STUDENT
    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get submissions by student ID")
    public ResponseEntity<List<Submission>> getSubmissionsByStudent(
            @PathVariable UUID studentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByStudent(studentId));
    }

    // GET BY ASSIGNMENT
    @GetMapping("/assignment/{assignmentId}")
    @Operation(summary = "Get submissions by assignment ID")
    public ResponseEntity<List<Submission>> getSubmissionsByAssignment(
            @PathVariable UUID assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId));
    }

    // UPDATE
    @PutMapping("/{id}")
    @Operation(summary = "Update a submission")
    public ResponseEntity<Submission> updateSubmission(
            @PathVariable UUID id,
            @Valid @RequestBody Submission submission) {
        return ResponseEntity.ok(submissionService.updateSubmission(id, submission));
    }

    // UPDATE STATUS
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update submission status")
    public ResponseEntity<Submission> updateStatus(
            @PathVariable UUID id,
            @RequestParam com.integrityai.submission.entity.SubmissionStatus status) {
        return ResponseEntity.ok(submissionService.updateStatus(id, status));
    }

    // DELETE
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a submission")
    public ResponseEntity<Void> deleteSubmission(@PathVariable UUID id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }
}