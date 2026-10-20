package com.integrityai.auth.dto;

import java.util.UUID;

public class LoginResponse {

    private String token;
    private String message;
    private UUID userId;
    private String name;
    private String email;
    private String role;
    private String rollNumber;
    private String phoneNumber;
    private String course;
    private String semester;
    private String department;
    private String assignedCourses;

    public LoginResponse() {}

    public LoginResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }

    public LoginResponse(String token, String message, UUID userId, String name, String email, String role) {
        this.token = token;
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public LoginResponse(
            String token,
            String message,
            UUID userId,
            String name,
            String email,
            String role,
            String rollNumber,
            String phoneNumber,
            String course,
            String semester,
            String department,
            String assignedCourses) {
        this.token = token;
        this.message = message;
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
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
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

    public String getRole() {
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
}