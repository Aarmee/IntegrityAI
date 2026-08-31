package com.integrityai.faculty.dto;

import java.util.UUID;

public class FacultyResponse {

    private UUID facultyId;
    private UUID userId;
    private String department;
    private String designation;

    public FacultyResponse(
            UUID facultyId,
            UUID userId,
            String department,
            String designation) {

        this.facultyId = facultyId;
        this.userId = userId;
        this.department = department;
        this.designation = designation;
    }

    public UUID getFacultyId() {
        return facultyId;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getDepartment() {
        return department;
    }

    public String getDesignation() {
        return designation;
    }
}