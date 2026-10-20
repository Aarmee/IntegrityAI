package com.integrityai.submission.client;

import com.integrityai.submission.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for notification-service.
 * Used to fire notifications after key submission events.
 * Uses Eureka service-name discovery (lb://notification-service).
 */
@FeignClient(
        name = "notification-service",
        url = "${notification.service.url:}"
)
public interface NotificationClient {

    @PostMapping("/api/notifications")
    Object createNotification(@RequestBody NotificationRequest request);
}
