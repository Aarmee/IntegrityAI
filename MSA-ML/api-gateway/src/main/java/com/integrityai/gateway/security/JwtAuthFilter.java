package com.integrityai.gateway.security;

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
 * JWT authentication filter at the API Gateway layer.
 *
 * Public paths (register, login) bypass this filter.
 * All other requests must carry a valid Bearer token.
 * The filter adds X-User-Email and X-User-Role headers so downstream
 * services know who made the request without re-validating the token.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/actuator",
            "/v3/api-docs",
            "/swagger-ui"
    );

    private final SecretKey secretKey;

    public JwtAuthFilter(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        if (path.equals("/") || path.isEmpty() || path.equals("/error") || path.equals("/favicon.ico")) {
            return true;
        }
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && !authHeader.isBlank()) {
            authHeader = authHeader.trim();
            if (authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
                token = authHeader.substring(7).trim();
            }
        }

        // Fallback for file downloads and media streams: check ?token= query parameter
        if (token == null || token.isBlank()) {
            String queryToken = request.getParameter("token");
            if (queryToken != null && !queryToken.isBlank()) {
                token = queryToken.trim();
            }
        }

        if (token == null || token.isBlank()) {
            sendError(response, HttpStatus.UNAUTHORIZED,
                    "Authorization header or token parameter missing");
            return;
        }

        if (token.startsWith("\"") && token.endsWith("\"") && token.length() > 1) {
            token = token.substring(1, token.length() - 1).trim();
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Forward user identity to downstream services via headers
            String email  = claims.getSubject();
            String role   = claims.get("role", String.class);
            String userId = claims.get("userId", String.class);
            String name   = claims.get("name", String.class);

            // Wrap request to add headers downstream services can read
            request.setAttribute("X-User-Email", email);
            request.setAttribute("X-User-Role",  role);
            if (userId != null) request.setAttribute("X-User-Id", userId);
            if (name != null)   request.setAttribute("X-User-Name", name);

            // Also add as request headers for downstream propagation
            // Spring Gateway MVC will forward all request headers
            jakarta.servlet.http.HttpServletRequestWrapper wrapper =
                    new jakarta.servlet.http.HttpServletRequestWrapper(request) {
                        @Override
                        public String getHeader(String headerName) {
                            if ("X-User-Email".equalsIgnoreCase(headerName)) return email;
                            if ("X-User-Role".equalsIgnoreCase(headerName))  return role;
                            if ("X-User-Id".equalsIgnoreCase(headerName))    return userId;
                            if ("X-User-Name".equalsIgnoreCase(headerName))  return name;
                            return super.getHeader(headerName);
                        }

                        @Override
                        public java.util.Enumeration<String> getHeaders(String headerName) {
                            if ("X-User-Email".equalsIgnoreCase(headerName) && email != null) {
                                return java.util.Collections.enumeration(java.util.List.of(email));
                            }
                            if ("X-User-Role".equalsIgnoreCase(headerName) && role != null) {
                                return java.util.Collections.enumeration(java.util.List.of(role));
                            }
                            if ("X-User-Id".equalsIgnoreCase(headerName) && userId != null) {
                                return java.util.Collections.enumeration(java.util.List.of(userId));
                            }
                            if ("X-User-Name".equalsIgnoreCase(headerName) && name != null) {
                                return java.util.Collections.enumeration(java.util.List.of(name));
                            }
                            return super.getHeaders(headerName);
                        }

                        @Override
                        public java.util.Enumeration<String> getHeaderNames() {
                            java.util.List<String> names = java.util.Collections.list(super.getHeaderNames());
                            if (email != null)  names.add("X-User-Email");
                            if (role != null)   names.add("X-User-Role");
                            if (userId != null) names.add("X-User-Id");
                            if (name != null)   names.add("X-User-Name");
                            return java.util.Collections.enumeration(names);
                        }
                    };

            filterChain.doFilter(wrapper, response);

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
