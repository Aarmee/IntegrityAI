package com.integrityai.auth.controller;

import com.integrityai.auth.dto.LoginRequest;
import com.integrityai.auth.dto.LoginResponse;
import com.integrityai.auth.dto.RegisterRequest;
import com.integrityai.auth.dto.UserResponse;
import com.integrityai.auth.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Auth Service", description = "Authentication and user management APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/api/auth/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/api/auth/login")
    @Operation(summary = "Login and receive JWT token")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(response);
    }

    // =========================
    // GET ALL USERS (Admin)
    // =========================

    @GetMapping("/api/users")
    @Operation(summary = "Get all users (admin)")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    // =========================
    // GET USER BY ID
    // (used internally by faculty-service via OpenFeign)
    // =========================

    @GetMapping("/api/users/{userId}")
    @Operation(summary = "Get user by ID (internal use)")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                authService.getUserById(userId)
        );
    }

    // =========================
    // UPDATE PROFILE
    // =========================

    @PutMapping("/api/users/{userId}")
    @Operation(summary = "Update user profile")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable UUID userId,
            @RequestBody com.integrityai.auth.dto.UpdateProfileRequest request) {

        return ResponseEntity.ok(
                authService.updateProfile(userId, request)
        );
    }
}