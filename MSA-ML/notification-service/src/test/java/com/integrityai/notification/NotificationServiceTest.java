package com.integrityai.notification;

import com.integrityai.notification.dto.NotificationRequest;
import com.integrityai.notification.dto.NotificationResponse;
import com.integrityai.notification.entity.Notification;
import com.integrityai.notification.entity.NotificationType;
import com.integrityai.notification.repository.NotificationRepository;
import com.integrityai.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification buildNotification(UUID id, UUID recipientId) {
        Notification n = new Notification();
        n.setNotificationId(id);
        n.setRecipientId(recipientId);
        n.setType(NotificationType.SUBMISSION_RECEIVED);
        n.setTitle("Test");
        n.setMessage("Test message");
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        return n;
    }

    @Test
    void createNotification_success() {
        UUID recipientId = UUID.randomUUID();
        NotificationRequest req = new NotificationRequest();
        req.setRecipientId(recipientId);
        req.setType(NotificationType.SUBMISSION_RECEIVED);
        req.setTitle("Submission Received");
        req.setMessage("Your submission has been received.");

        Notification saved = buildNotification(UUID.randomUUID(), recipientId);
        when(notificationRepository.save(any())).thenReturn(saved);

        NotificationResponse response = notificationService.createNotification(req);

        assertThat(response.getRecipientId()).isEqualTo(recipientId);
        assertThat(response.getType()).isEqualTo(NotificationType.SUBMISSION_RECEIVED);
        assertThat(response.isRead()).isFalse();
    }

    @Test
    void getNotificationById_found() {
        UUID id = UUID.randomUUID();
        Notification n = buildNotification(id, UUID.randomUUID());
        when(notificationRepository.findById(id)).thenReturn(Optional.of(n));

        NotificationResponse response = notificationService.getNotificationById(id);
        assertThat(response.getNotificationId()).isEqualTo(id);
    }

    @Test
    void getNotificationById_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(notificationRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.getNotificationById(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getByRecipient_returnsList() {
        UUID recipientId = UUID.randomUUID();
        Notification n1 = buildNotification(UUID.randomUUID(), recipientId);
        Notification n2 = buildNotification(UUID.randomUUID(), recipientId);
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId)).thenReturn(List.of(n1, n2));

        List<NotificationResponse> results = notificationService.getByRecipient(recipientId);
        assertThat(results).hasSize(2);
    }

    @Test
    void getUnreadByRecipient_filtersUnread() {
        UUID recipientId = UUID.randomUUID();
        Notification unread = buildNotification(UUID.randomUUID(), recipientId);
        when(notificationRepository.findByRecipientIdAndRead(recipientId, false))
                .thenReturn(List.of(unread));

        List<NotificationResponse> results = notificationService.getUnreadByRecipient(recipientId);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).isRead()).isFalse();
    }

    @Test
    void markAsRead_setsReadTrue() {
        UUID id = UUID.randomUUID();
        Notification n = buildNotification(id, UUID.randomUUID());
        when(notificationRepository.findById(id)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(id);
        assertThat(response.isRead()).isTrue();
    }

    @Test
    void deleteNotification_success() {
        UUID id = UUID.randomUUID();
        when(notificationRepository.existsById(id)).thenReturn(true);
        doNothing().when(notificationRepository).deleteById(id);

        assertThatCode(() -> notificationService.deleteNotification(id)).doesNotThrowAnyException();
    }

    @Test
    void deleteNotification_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(notificationRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> notificationService.deleteNotification(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getAllNotifications_returnsList() {
        Notification n1 = buildNotification(UUID.randomUUID(), UUID.randomUUID());
        when(notificationRepository.findAll()).thenReturn(List.of(n1));

        List<NotificationResponse> results = notificationService.getAllNotifications();
        assertThat(results).hasSize(1);
    }
}
