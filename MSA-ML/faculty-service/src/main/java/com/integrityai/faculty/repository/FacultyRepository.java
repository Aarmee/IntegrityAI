package com.integrityai.faculty.repository;

import com.integrityai.faculty.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FacultyRepository
        extends JpaRepository<Faculty, UUID> {

    Optional<Faculty> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}