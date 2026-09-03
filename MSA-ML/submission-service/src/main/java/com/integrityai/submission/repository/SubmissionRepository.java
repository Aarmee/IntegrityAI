package com.integrityai.submission.repository;

import com.integrityai.submission.entity.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.UUID;

public interface SubmissionRepository extends MongoRepository<Submission, UUID> {

    List<Submission> findByStudentId(UUID studentId);

    List<Submission> findByAssignmentId(UUID assignmentId);
}