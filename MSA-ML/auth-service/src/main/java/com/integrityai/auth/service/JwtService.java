package com.integrityai.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration.ms:86400000}") long expirationMs) {

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email, String role) {
        return generateToken(email, role, null, null);
    }

    public String generateToken(String email, String role, UUID userId, String name) {
        var builder = Jwts.builder()
                .subject(email)
                .claim("role", role);

        if (userId != null) {
            builder.claim("userId", userId.toString());
        }
        if (name != null) {
            builder.claim("name", name);
        }

        return builder
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + expirationMs)
                )
                .signWith(key)
                .compact();
    }
}

