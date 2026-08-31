package com.integrityai.faculty.repository;

import com.integrityai.faculty.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    List<Assignment> findByFacultyId(UUID facultyId);
}