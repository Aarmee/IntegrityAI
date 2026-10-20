package com.integrityai.faculty.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

/**
 * Feign client for auth-service.
 * Uses Eureka service-name discovery (lb://auth-service).
 * The url fallback is only used if Eureka is unavailable.
 */
@FeignClient(
        name = "auth-service",
        url = "${auth.service.url:}"
)
public interface AuthClient {

    @GetMapping("/api/users/{userId}")
    Object getUserById(
            @PathVariable UUID userId
    );
}