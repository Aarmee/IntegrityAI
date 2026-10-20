package com.integrityai.auth;

import com.integrityai.auth.dto.RegisterRequest;
import com.integrityai.auth.dto.UserResponse;
import com.integrityai.auth.entity.User;
import com.integrityai.auth.repository.UserRepository;
import com.integrityai.auth.service.AuthService;
import com.integrityai.auth.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    // =====================================================================
    // REGISTER
    // =====================================================================

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alice");
        req.setEmail("alice@test.com");
        req.setPassword("password123");
        req.setRole("STUDENT");

        when(userRepository.existsByEmail("alice@test.com")).thenReturn(false);

        User saved = new User();
        saved.setUserId(UUID.randomUUID());
        saved.setName("Alice");
        saved.setEmail("alice@test.com");
        saved.setRole(User.Role.STUDENT);
        saved.setCreatedAt(LocalDateTime.now());

        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserResponse response = authService.register(req);

        assertThat(response.getEmail()).isEqualTo("alice@test.com");
        assertThat(response.getRole()).isEqualTo(User.Role.STUDENT);
    }

    @Test
    void register_duplicateEmail_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Bob");
        req.setEmail("bob@test.com");
        req.setPassword("password");
        req.setRole("FACULTY");

        when(userRepository.existsByEmail("bob@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void register_invalidRole_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Charlie");
        req.setEmail("charlie@test.com");
        req.setPassword("password");
        req.setRole("INVALID_ROLE");

        when(userRepository.existsByEmail("charlie@test.com")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid role");
    }

    // =====================================================================
    // LOGIN
    // =====================================================================

    @Test
    void login_success() {
        String rawPassword = "mypassword";
        String hashed = passwordEncoder.encode(rawPassword);

        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setName("Alice");
        user.setEmail("alice@test.com");
        user.setPasswordHash(hashed);
        user.setRole(User.Role.STUDENT);

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(eq("alice@test.com"), eq("STUDENT"), any(), any())).thenReturn("mock.jwt.token");

        com.integrityai.auth.dto.LoginResponse response = authService.login("alice@test.com", rawPassword);

        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getEmail()).isEqualTo("alice@test.com");
        assertThat(response.getRole()).isEqualTo("STUDENT");
    }

    @Test
    void getAllUsers_success() {
        User u1 = new User();
        u1.setUserId(UUID.randomUUID());
        u1.setName("User 1");
        u1.setEmail("u1@test.com");
        u1.setRole(User.Role.STUDENT);

        User u2 = new User();
        u2.setUserId(UUID.randomUUID());
        u2.setName("User 2");
        u2.setEmail("u2@test.com");
        u2.setRole(User.Role.FACULTY);

        when(userRepository.findAll()).thenReturn(java.util.List.of(u1, u2));

        java.util.List<UserResponse> list = authService.getAllUsers();
        assertThat(list).hasSize(2);
        assertThat(list.get(0).getEmail()).isEqualTo("u1@test.com");
    }

    @Test
    void login_wrongPassword_throws() {
        String hashed = passwordEncoder.encode("correctpassword");

        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail("bob@test.com");
        user.setPasswordHash(hashed);
        user.setRole(User.Role.FACULTY);

        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login("bob@test.com", "wrongpassword"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_unknownEmail_throws() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("unknown@test.com", "password"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email or password");
    }

    // =====================================================================
    // GET USER BY ID
    // =====================================================================

    @Test
    void getUserById_found() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setUserId(id);
        user.setName("Dave");
        user.setEmail("dave@test.com");
        user.setRole(User.Role.ADMIN);

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        UserResponse response = authService.getUserById(id);
        assertThat(response.getName()).isEqualTo("Dave");
    }

    @Test
    void getUserById_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getUserById(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    // =====================================================================
    // JWT SERVICE
    // =====================================================================

    @Test
    void jwtService_generateAndVerifyToken() {
        JwtService jwt = new JwtService(
                "integrityai-secret-key-for-jwt-authentication-2026-must-be-at-least-256-bits",
                86400000L
        );
        String token = jwt.generateToken("test@example.com", "STUDENT");
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
    }
}
