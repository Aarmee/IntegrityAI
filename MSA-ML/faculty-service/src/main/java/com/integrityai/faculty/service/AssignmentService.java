package com.integrityai.faculty.service;

import com.integrityai.faculty.dto.AssignmentRequest;
import com.integrityai.faculty.dto.AssignmentResponse;
import com.integrityai.faculty.entity.Assignment;
import com.integrityai.faculty.repository.AssignmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public AssignmentService(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    // =========================
    // CREATE
    // =========================

    public AssignmentResponse createAssignment(AssignmentRequest request) {

        Assignment assignment = new Assignment();
        assignment.setFacultyId(request.getFacultyId());
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setSubject(request.getSubject());
        assignment.setDeadline(request.getDeadline());
        assignment.setTargetCourse(request.getTargetCourse());
        assignment.setTargetSemester(request.getTargetSemester());

        Assignment saved = assignmentRepository.save(assignment);
        return toResponse(saved);
    }

    // =========================
    // GET ALL
    // =========================

    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET BY ID
    // =========================

    public AssignmentResponse getAssignmentById(UUID assignmentId) {

        Assignment assignment = assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assignment not found with ID: " + assignmentId
                        )
                );

        return toResponse(assignment);
    }

    // =========================
    // GET BY FACULTY
    // =========================

    public List<AssignmentResponse> getAssignmentsByFaculty(UUID facultyId) {
        return assignmentRepository.findByFacultyId(facultyId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // UPDATE
    // =========================

    public AssignmentResponse updateAssignment(UUID assignmentId, AssignmentRequest request) {

        Assignment existing = assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assignment not found with ID: " + assignmentId
                        )
                );

        existing.setFacultyId(request.getFacultyId());
        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setSubject(request.getSubject());
        existing.setDeadline(request.getDeadline());
        if (request.getTargetCourse() != null) {
            existing.setTargetCourse(request.getTargetCourse());
        }
        if (request.getTargetSemester() != null) {
            existing.setTargetSemester(request.getTargetSemester());
        }

        return toResponse(assignmentRepository.save(existing));
    }

    // =========================
    // DELETE
    // =========================

    public void deleteAssignment(UUID assignmentId) {

        if (!assignmentRepository.existsById(assignmentId)) {
            throw new RuntimeException(
                    "Assignment not found with ID: " + assignmentId
            );
        }

        assignmentRepository.deleteById(assignmentId);
    }

    // =========================
    // HELPER
    // =========================

    private AssignmentResponse toResponse(Assignment assignment) {
        return new AssignmentResponse(
                assignment.getAssignmentId(),
                assignment.getFacultyId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getSubject(),
                assignment.getDeadline(),
                assignment.getTargetCourse(),
                assignment.getTargetSemester(),
                assignment.getCreatedAt()
        );
    }
}
