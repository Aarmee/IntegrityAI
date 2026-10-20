package com.integrityai.report.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Propagates JWT Bearer token and gateway identity headers (X-User-Email, X-User-Role, etc.)
 * across inter-service OpenFeign calls (e.g. to notification-service).
 */
@Component
public class FeignClientInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();

            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && !authHeader.isBlank()) {
                template.header("Authorization", authHeader);
            }

            String userEmail = request.getHeader("X-User-Email");
            if (userEmail != null && !userEmail.isBlank()) {
                template.header("X-User-Email", userEmail);
            }

            String userRole = request.getHeader("X-User-Role");
            if (userRole != null && !userRole.isBlank()) {
                template.header("X-User-Role", userRole);
            }

            String userId = request.getHeader("X-User-Id");
            if (userId != null && !userId.isBlank()) {
                template.header("X-User-Id", userId);
            }
        } else {
            // Background thread fallback identity
            template.header("X-User-Email", "system@integrityai.internal");
            template.header("X-User-Role", "SYSTEM");
        }

        template.header("X-Internal-Service", "report-service");
    }
}
