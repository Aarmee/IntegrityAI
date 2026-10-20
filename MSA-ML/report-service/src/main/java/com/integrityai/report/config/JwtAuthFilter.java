package com.integrityai.report.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Per-service JWT filter for report-service.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final List<String> PUBLIC_PATHS = List.of(
            "/swagger-ui",
            "/v3/api-docs",
            "/actuator"
    );

    private final SecretKey secretKey;

    public JwtAuthFilter(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String userEmail = request.getHeader("X-User-Email");
        if (userEmail != null && !userEmail.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, HttpStatus.UNAUTHORIZED,
                    "Authorization header missing or malformed");
            return;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            request.setAttribute("X-User-Email", claims.getSubject());
            request.setAttribute("X-User-Role",  claims.get("role", String.class));
            filterChain.doFilter(request, response);

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            sendError(response, HttpStatus.UNAUTHORIZED, "Token has expired");
        } catch (io.jsonwebtoken.security.SignatureException e) {
            sendError(response, HttpStatus.UNAUTHORIZED, "Invalid token signature");
        } catch (io.jsonwebtoken.JwtException e) {
            sendError(response, HttpStatus.UNAUTHORIZED, "Invalid token: " + e.getMessage());
        }
    }

    private void sendError(HttpServletResponse response,
                           HttpStatus status,
                           String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"status\":" + status.value() +
                ",\"error\":\"" + status.getReasonPhrase() +
                "\",\"message\":\"" + message + "\"}"
        );
    }
}
