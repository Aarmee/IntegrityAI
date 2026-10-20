package com.integrityai.faculty.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id", updatable = false, nullable = false)
    private UUID assignmentId;

    @Column(name = "faculty_id", nullable = false)
    private UUID facultyId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "subject", nullable = false, length = 100)
    private String subject;

    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    @Column(name = "target_course", length = 100)
    private String targetCourse;

    @Column(name = "target_semester", length = 20)
    private String targetSemester;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Assignment() {
    }

    public UUID getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(UUID assignmentId) {
        this.assignmentId = assignmentId;
    }

    public UUID getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(UUID facultyId) {
        this.facultyId = facultyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getTargetCourse() {
        return targetCourse;
    }

    public void setTargetCourse(String targetCourse) {
        this.targetCourse = targetCourse;
    }

    public String getTargetSemester() {
        return targetSemester;
    }

    public void setTargetSemester(String targetSemester) {
        this.targetSemester = targetSemester;
    }
}