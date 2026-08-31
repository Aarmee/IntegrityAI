package com.integrityai.faculty.service;

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

    // Create assignment
    public Assignment createAssignment(Assignment assignment) {

        if (assignment.getFacultyId() == null) {
            throw new RuntimeException("Faculty ID is required");
        }

        if (assignment.getTitle() == null ||
                assignment.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Assignment title is required");
        }

        if (assignment.getSubject() == null ||
                assignment.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject is required");
        }

        if (assignment.getDeadline() == null) {
            throw new RuntimeException("Deadline is required");
        }

        return assignmentRepository.save(assignment);
    }

    // Get all assignments
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    // Get assignment by ID
    public Assignment getAssignmentById(UUID assignmentId) {

        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assignment not found with ID: " + assignmentId
                        )
                );
    }

    // Get assignments by faculty ID
    public List<Assignment> getAssignmentsByFaculty(UUID facultyId) {
        return assignmentRepository.findByFacultyId(facultyId);
    }

    // Update assignment
    public Assignment updateAssignment(
            UUID assignmentId,
            Assignment updatedAssignment) {

        Assignment existingAssignment =
                assignmentRepository.findById(assignmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assignment not found with ID: "
                                                + assignmentId
                                )
                        );

        existingAssignment.setFacultyId(
                updatedAssignment.getFacultyId()
        );

        existingAssignment.setTitle(
                updatedAssignment.getTitle()
        );

        existingAssignment.setDescription(
                updatedAssignment.getDescription()
        );

        existingAssignment.setSubject(
                updatedAssignment.getSubject()
        );

        existingAssignment.setDeadline(
                updatedAssignment.getDeadline()
        );

        return assignmentRepository.save(existingAssignment);
    }

    // Delete assignment
    public void deleteAssignment(UUID assignmentId) {

        if (!assignmentRepository.existsById(assignmentId)) {
            throw new RuntimeException(
                    "Assignment not found with ID: " + assignmentId
            );
        }

        assignmentRepository.deleteById(assignmentId);
    }
}