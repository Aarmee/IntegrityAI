package com.integrityai.auth.dto;

public class UpdateProfileRequest {

    private String name;
    private String phoneNumber;
    private String rollNumber;
    private String course;
    private String semester;
    private String department;
    private String assignedCourses;
    private String password;

    public UpdateProfileRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAssignedCourses() {
        return assignedCourses;
    }

    public void setAssignedCourses(String assignedCourses) {
        this.assignedCourses = assignedCourses;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
