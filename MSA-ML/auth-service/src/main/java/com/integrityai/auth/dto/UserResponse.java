package com.integrityai.auth.dto;

import com.integrityai.auth.entity.User;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserResponse {

    private UUID userId;
    private String name;
    private String email;
    private User.Role role;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}