package com.integrityai.submission.service;

import com.integrityai.submission.client.FacultyClient;
import com.integrityai.submission.entity.Submission;
import com.integrityai.submission.entity.SubmissionStatus;
import com.integrityai.submission.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final FacultyClient facultyClient;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            FacultyClient facultyClient) {

        this.submissionRepository = submissionRepository;
        this.facultyClient = facultyClient;
    }

    // CREATE
    public Submission createSubmission(Submission submission) {

        // Verify that the assignment exists in Faculty Service
        facultyClient.getAssignmentById(
                submission.getAssignmentId()
        );

        submission.setSubmissionId(UUID.randomUUID());
        submission.setStatus(SubmissionStatus.Uploaded);
        submission.setSubmittedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    // GET ALL
    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    // GET BY ID
    public Submission getSubmissionById(UUID id) {

        return submissionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Submission not found with ID: " + id
                        )
                );
    }

    // GET BY STUDENT
    public List<Submission> getSubmissionsByStudent(UUID studentId) {

        return submissionRepository.findByStudentId(studentId);
    }

    // GET BY ASSIGNMENT
    public List<Submission> getSubmissionsByAssignment(UUID assignmentId) {

        return submissionRepository.findByAssignmentId(assignmentId);
    }

    // UPDATE
    public Submission updateSubmission(
            UUID id,
            Submission updatedSubmission) {

        Submission existingSubmission =
                submissionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Submission not found with ID: " + id
                                )
                        );

        // Verify assignment if it is being changed
        if (updatedSubmission.getAssignmentId() != null) {
            facultyClient.getAssignmentById(
                    updatedSubmission.getAssignmentId()
            );
        }

        existingSubmission.setStudentId(
                updatedSubmission.getStudentId()
        );

        existingSubmission.setAssignmentId(
                updatedSubmission.getAssignmentId()
        );

        existingSubmission.setFileType(
                updatedSubmission.getFileType()
        );

        existingSubmission.setFileUrl(
                updatedSubmission.getFileUrl()
        );

        if (updatedSubmission.getStatus() != null) {
            existingSubmission.setStatus(
                    updatedSubmission.getStatus()
            );
        }

        return submissionRepository.save(existingSubmission);
    }

    // DELETE
    public void deleteSubmission(UUID id) {

        if (!submissionRepository.existsById(id)) {
            throw new RuntimeException(
                    "Submission not found with ID: " + id
            );
        }

        submissionRepository.deleteById(id);
    }
}