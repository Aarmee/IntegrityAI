package com.integrityai.report.repository;

import com.integrityai.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    Optional<Report> findBySubmissionId(UUID submissionId);

    List<Report> findByStudentId(UUID studentId);

    List<Report> findByAssignmentId(UUID assignmentId);
}
