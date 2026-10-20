package com.integrityai.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Root informational endpoint for API Gateway.
 * Returns service status and available routes when visited in a browser or tested.
 */
@RestController
public class GatewayHomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "IntegrityAI API Gateway",
                "version", "1.0.0",
                "message", "API Gateway is running. Access the application via Frontend at http://localhost:5173",
                "endpoints", Map.of(
                        "auth", "/api/auth/**",
                        "faculty", "/api/faculty/**",
                        "assignments", "/api/assignments/**",
                        "submissions", "/api/submissions/**",
                        "notifications", "/api/notifications/**",
                        "reports", "/api/reports/**",
                        "analysis", "/api/analysis/**"
                )
        ));
    }
}
