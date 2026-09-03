package com.integrityai.submission.controller;

import com.integrityai.submission.entity.Submission;
import com.integrityai.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // CREATE
    @PostMapping
    @Operation(summary = "Create a new submission")
    public ResponseEntity<Submission> createSubmission(
            @Valid @RequestBody Submission submission) {

        Submission created =
                submissionService.createSubmission(submission);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // GET ALL
    @GetMapping
    @Operation(summary = "Get all submissions")
    public ResponseEntity<List<Submission>> getAllSubmissions() {

        return ResponseEntity.ok(
                submissionService.getAllSubmissions()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    @Operation(summary = "Get submission by ID")
    public ResponseEntity<Submission> getSubmissionById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                submissionService.getSubmissionById(id)
        );
    }

    // GET BY STUDENT
    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get submissions by student ID")
    public ResponseEntity<List<Submission>> getSubmissionsByStudent(
            @PathVariable UUID studentId) {

        return ResponseEntity.ok(
                submissionService.getSubmissionsByStudent(studentId)
        );
    }

    // GET BY ASSIGNMENT
    @GetMapping("/assignment/{assignmentId}")
    @Operation(summary = "Get submissions by assignment ID")
    public ResponseEntity<List<Submission>> getSubmissionsByAssignment(
            @PathVariable UUID assignmentId) {

        return ResponseEntity.ok(
                submissionService.getSubmissionsByAssignment(assignmentId)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    @Operation(summary = "Update a submission")
    public ResponseEntity<Submission> updateSubmission(
            @PathVariable UUID id,
            @Valid @RequestBody Submission submission) {

        return ResponseEntity.ok(
                submissionService.updateSubmission(id, submission)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a submission")
    public ResponseEntity<Void> deleteSubmission(
            @PathVariable UUID id) {

        submissionService.deleteSubmission(id);

        return ResponseEntity.noContent().build();
    }
}