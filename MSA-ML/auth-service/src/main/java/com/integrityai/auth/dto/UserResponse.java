package com.integrityai.auth.dto;

import com.integrityai.auth.entity.User;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserResponse {

    private UUID userId;
    private String name;
    private String email;
    private User.Role role;
    private String rollNumber;
    private String phoneNumber;
    private String course;
    private String semester;
    private String department;
    private String assignedCourses;
    private LocalDateTime createdAt;

    public UserResponse(
            UUID userId,
            String name,
            String email,
            User.Role role,
            LocalDateTime createdAt) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    public UserResponse(
            UUID userId,
            String name,
            String email,
            User.Role role,
            String rollNumber,
            String phoneNumber,
            String course,
            String semester,
            String department,
            String assignedCourses,
            LocalDateTime createdAt) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.rollNumber = rollNumber;
        this.phoneNumber = phoneNumber;
        this.course = course;
        this.semester = semester;
        this.department = department;
        this.assignedCourses = assignedCourses;
        this.createdAt = createdAt;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public User.Role getRole() {
        return role;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getCourse() {
        return course;
    }

    public String getSemester() {
        return semester;
    }

    public String getDepartment() {
        return department;
    }

    public String getAssignedCourses() {
        return assignedCourses;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}