package com.integrityai.faculty.controller;

import com.integrityai.faculty.dto.AssignmentRequest;
import com.integrityai.faculty.dto.AssignmentResponse;
import com.integrityai.faculty.service.AssignmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@Tag(name = "Assignments", description = "Assignment management APIs")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final com.integrityai.faculty.service.DeadlineReminderScheduler reminderScheduler;

    public AssignmentController(AssignmentService assignmentService,
                                com.integrityai.faculty.service.DeadlineReminderScheduler reminderScheduler) {
        this.assignmentService = assignmentService;
        this.reminderScheduler = reminderScheduler;
    }

    // REMIND PENDING STUDENTS (ON-DEMAND)
    @PostMapping("/{assignmentId}/remind-pending")
    @Operation(summary = "Send urgent deadline reminder emails to all pending students")
    public ResponseEntity<java.util.Map<String, Object>> remindPendingStudents(
            @PathVariable UUID assignmentId) {
        int sent = reminderScheduler.triggerManualReminders(assignmentId);
        return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "remindersSent", sent,
                "message", "Deadline reminder emails dispatched to " + sent + " pending student(s)."
        ));
    }

    // SEND FACULTY ROLL-CALL SUMMARY (ON-DEMAND)
    @PostMapping("/{assignmentId}/send-summary-email")
    @Operation(summary = "Dispatch post-deadline submission roll-call email to course faculty")
    public ResponseEntity<java.util.Map<String, Object>> sendSummaryEmail(
            @PathVariable UUID assignmentId) {
        boolean sent = reminderScheduler.triggerFacultySummary(assignmentId);
        return ResponseEntity.ok(java.util.Map.of(
                "success", sent,
                "message", sent ? "Official coursework submission roll-call email dispatched to course faculty." : "Failed to dispatch email report."
        ));
    }

    // CREATE
    @PostMapping
    @Operation(summary = "Create a new assignment")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assignmentService.createAssignment(request));
    }

    // GET ALL
    @GetMapping
    @Operation(summary = "Get all assignments")
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments() {

        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    // GET BY ID
    @GetMapping("/{assignmentId}")
    @Operation(summary = "Get assignment by ID")
    public ResponseEntity<AssignmentResponse> getAssignmentById(
            @PathVariable UUID assignmentId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentById(assignmentId)
        );
    }

    // GET BY FACULTY
    @GetMapping("/faculty/{facultyId}")
    @Operation(summary = "Get assignments by faculty ID")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByFaculty(
            @PathVariable UUID facultyId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByFaculty(facultyId)
        );
    }

    // UPDATE
    @PutMapping("/{assignmentId}")
    @Operation(summary = "Update an assignment")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable UUID assignmentId,
            @Valid @RequestBody AssignmentRequest request) {

        return ResponseEntity.ok(
                assignmentService.updateAssignment(assignmentId, request)
        );
    }

    // DELETE
    @DeleteMapping("/{assignmentId}")
    @Operation(summary = "Delete an assignment")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable UUID assignmentId) {

        assignmentService.deleteAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }
}
