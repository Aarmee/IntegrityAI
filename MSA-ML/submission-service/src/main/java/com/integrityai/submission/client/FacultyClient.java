package com.integrityai.submission.client;

import com.integrityai.submission.dto.AssignmentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

/**
 * Feign client for faculty-service.
 * Uses Eureka service-name discovery (lb://faculty-service).
 * The url fallback is only used if Eureka is unavailable.
 */
@FeignClient(
        name = "faculty-service",
        url = "${faculty.service.url:}"
)
public interface FacultyClient {

    @GetMapping("/api/assignments/{assignmentId}")
    AssignmentResponse getAssignmentById(
            @PathVariable UUID assignmentId
    );
}