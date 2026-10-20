package com.integrityai.report.client;

import com.integrityai.report.dto.AnalysisResult;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * Feign client for ai-analysis-service (Python/FastAPI on port 8090).
 * Communication is HTTP-only — no Maven dependency on ai-analysis-service.
 * Uses direct URL since ai-analysis-service is a Python service,
 * not a Spring Boot Eureka client.
 */
@FeignClient(
        name = "ai-analysis-service",
        url = "${ai.analysis.service.url:http://localhost:8090}"
)
public interface AiAnalysisClient {

    @PostMapping("/api/analysis")
    AnalysisResult analyse(@RequestBody Map<String, String> request);
}
