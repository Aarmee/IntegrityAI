package com.integrityai.auth.service;

import com.integrityai.auth.dto.RegisterRequest;
import com.integrityai.auth.dto.UpdateProfileRequest;
import com.integrityai.auth.dto.UserResponse;
import com.integrityai.auth.entity.User;
import com.integrityai.auth.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================

    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        try {

            user.setRole(
                    User.Role.valueOf(
                            request.getRole().toUpperCase()
                    )
            );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid role. Use STUDENT, FACULTY or ADMIN"
            );
        }

        user.setRollNumber(request.getRollNumber());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCourse(request.getCourse());
        user.setSemester(request.getSemester());
        user.setDepartment(request.getDepartment());
        user.setAssignedCourses(request.getAssignedCourses());

        User savedUser = userRepository.save(user);

        // Send welcome email & notification asynchronously
        sendWelcomeNotification(savedUser);

        return toUserResponse(savedUser);
    }

    private void sendWelcomeNotification(User user) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                String notificationUrl = System.getenv().getOrDefault("NOTIFICATION_SERVICE_URL", "http://localhost:8084");
                StringBuilder urlBuilder = new StringBuilder(notificationUrl)
                        .append("/api/notifications/welcome")
                        .append("?userId=").append(user.getUserId())
                        .append("&email=").append(java.net.URLEncoder.encode(user.getEmail(), java.nio.charset.StandardCharsets.UTF_8))
                        .append("&name=").append(java.net.URLEncoder.encode(user.getName(), java.nio.charset.StandardCharsets.UTF_8))
                        .append("&role=").append(user.getRole().name());

                if (user.getCourse() != null) {
                    urlBuilder.append("&course=").append(java.net.URLEncoder.encode(user.getCourse(), java.nio.charset.StandardCharsets.UTF_8));
                }
                if (user.getSemester() != null) {
                    urlBuilder.append("&semester=").append(java.net.URLEncoder.encode(user.getSemester(), java.nio.charset.StandardCharsets.UTF_8));
                }
                if (user.getRollNumber() != null) {
                    urlBuilder.append("&rollNumber=").append(java.net.URLEncoder.encode(user.getRollNumber(), java.nio.charset.StandardCharsets.UTF_8));
                }
                if (user.getDepartment() != null) {
                    urlBuilder.append("&department=").append(java.net.URLEncoder.encode(user.getDepartment(), java.nio.charset.StandardCharsets.UTF_8));
                }

                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(urlBuilder.toString()))
                        .header("X-Internal-Service", "auth-service")
                        .POST(java.net.http.HttpRequest.BodyPublishers.noBody())
                        .timeout(java.time.Duration.ofSeconds(5))
                        .build();

                client.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.discarding());
            } catch (Exception e) {
                // Best-effort notification dispatch: registration never fails if notification-service is busy
                System.err.println("[AuthService] Notice: Welcome email dispatch: " + e.getMessage());
            }
        });
    }

    // =========================
    // GET ALL USERS (Admin)
    // =========================

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    // =========================
    // GET USER BY ID
    // =========================

    public UserResponse getUserById(UUID userId) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with ID: " + userId
                        )
                );

        return toUserResponse(user);
    }

    // =========================
    // UPDATE PROFILE
    // =========================

    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getRollNumber() != null) {
            user.setRollNumber(request.getRollNumber().trim());
        }
        if (request.getCourse() != null) {
            user.setCourse(request.getCourse().trim());
        }
        if (request.getSemester() != null) {
            user.setSemester(request.getSemester().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getAssignedCourses() != null) {
            user.setAssignedCourses(request.getAssignedCourses().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        }

        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    // =========================
    // LOGIN
    // =========================

    public com.integrityai.auth.dto.LoginResponse login(
            String email,
            String password) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getUserId(),
                user.getName()
        );

        return new com.integrityai.auth.dto.LoginResponse(
                token,
                "Login successful",
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getRollNumber(),
                user.getPhoneNumber(),
                user.getCourse(),
                user.getSemester(),
                user.getDepartment(),
                user.getAssignedCourses()
        );
    }

    private UserResponse toUserResponse(User u) {
        return new UserResponse(
                u.getUserId(),
                u.getName(),
                u.getEmail(),
                u.getRole(),
                u.getRollNumber(),
                u.getPhoneNumber(),
                u.getCourse(),
                u.getSemester(),
                u.getDepartment(),
                u.getAssignedCourses(),
                u.getCreatedAt()
        );
    }
}