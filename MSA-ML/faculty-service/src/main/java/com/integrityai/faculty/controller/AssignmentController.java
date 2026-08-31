package com.integrityai.faculty.controller;

import com.integrityai.faculty.entity.Assignment;
import com.integrityai.faculty.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Assignment> createAssignment(
            @RequestBody Assignment assignment) {

        Assignment savedAssignment =
                assignmentService.createAssignment(assignment);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedAssignment);
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments() {

        return ResponseEntity.ok(
                assignmentService.getAllAssignments()
        );
    }

    // GET BY ID
    @GetMapping("/{assignmentId}")
    public ResponseEntity<Assignment> getAssignmentById(
            @PathVariable UUID assignmentId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentById(assignmentId)
        );
    }

    // GET BY FACULTY
    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByFaculty(
            @PathVariable UUID facultyId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByFaculty(facultyId)
        );
    }

    // UPDATE
    @PutMapping("/{assignmentId}")
    public ResponseEntity<Assignment> updateAssignment(
            @PathVariable UUID assignmentId,
            @RequestBody Assignment assignment) {

        return ResponseEntity.ok(
                assignmentService.updateAssignment(
                        assignmentId,
                        assignment
                )
        );
    }

    // DELETE
    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable UUID assignmentId) {

        assignmentService.deleteAssignment(assignmentId);

        return ResponseEntity.noContent().build();
    }
}