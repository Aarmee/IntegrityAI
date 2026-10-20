package com.integrityai.submission.client;

import com.integrityai.submission.dto.AnalysisRequest;
import com.integrityai.submission.dto.AnalysisResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for ai-analysis-service (Python/FastAPI).
 * Called after a file upload to trigger analysis asynchronously.
 * Uses direct URL since FastAPI is not a Spring/Eureka service.
 */
@FeignClient(
        name = "ai-analysis-service-from-submission",
        url = "${ai.analysis.service.url:http://localhost:8090}"
)
public interface AiAnalysisClient {

    @PostMapping("/api/analysis")
    AnalysisResponse triggerAnalysis(@RequestBody AnalysisRequest request);
}
