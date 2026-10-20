package com.integrityai.report.client;

import com.integrityai.report.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for notification-service.
 * Used to fire REPORT_READY / ANALYSIS_COMPLETE notifications.
 * Uses Eureka service-name discovery (lb://notification-service).
 */
@FeignClient(
        name = "notification-service-from-report",
        url = "${notification.service.url:}"
)
public interface NotificationClient {

    @PostMapping("/api/notifications")
    Object createNotification(@RequestBody NotificationRequest request);
}
