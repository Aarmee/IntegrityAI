package com.integrityai.submission;

import com.integrityai.submission.client.AiAnalysisClient;
import com.integrityai.submission.client.FacultyClient;
import com.integrityai.submission.client.NotificationClient;
import com.integrityai.submission.dto.AssignmentResponse;
import com.integrityai.submission.entity.Submission;
import com.integrityai.submission.entity.SubmissionStatus;
import com.integrityai.submission.repository.SubmissionRepository;
import com.integrityai.submission.service.FileStorageService;
import com.integrityai.submission.service.SubmissionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock private SubmissionRepository submissionRepository;
    @Mock private FacultyClient facultyClient;
    @Mock private FileStorageService fileStorageService;
    @Mock private AiAnalysisClient aiAnalysisClient;
    @Mock private NotificationClient notificationClient;

    @InjectMocks
    private SubmissionService submissionService;

    private Submission buildSubmission(UUID id, UUID studentId, UUID assignmentId) {
        Submission s = new Submission();
        s.setSubmissionId(id);
        s.setStudentId(studentId);
        s.setAssignmentId(assignmentId);
        s.setStatus(SubmissionStatus.UPLOADED);
        s.setSubmittedAt(LocalDateTime.now());
        return s;
    }

    // =====================================================================
    // FILE UPLOAD
    // =====================================================================

    @Test
    void createSubmissionWithFile_success() {
        UUID studentId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();

        AssignmentResponse assignmentResp = new AssignmentResponse();
        when(facultyClient.getAssignmentById(assignmentId)).thenReturn(assignmentResp);

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "hello world".getBytes()
        );

        com.integrityai.submission.entity.FileType fileType =
                com.integrityai.submission.entity.FileType.CODE;
        FileStorageService.StoredFile stored =
                new FileStorageService.StoredFile("/uploads/test.txt", fileType);
        when(fileStorageService.store(any(), any())).thenReturn(stored);

        Submission saved = new Submission();
        saved.setSubmissionId(UUID.randomUUID());
        saved.setStudentId(studentId);
        saved.setAssignmentId(assignmentId);
        saved.setStatus(SubmissionStatus.PROCESSING);
        saved.setSubmittedAt(LocalDateTime.now());
        when(submissionRepository.save(any())).thenReturn(saved);

        // AI and notification clients are best-effort, don't need stubbing for success path
        when(aiAnalysisClient.triggerAnalysis(any())).thenReturn(null);
        when(notificationClient.createNotification(any())).thenReturn(null);

        Submission result = submissionService.createSubmissionWithFile(studentId, assignmentId, file);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(SubmissionStatus.PROCESSING);
        verify(submissionRepository).save(any());
    }

    @Test
    void createSubmissionWithFile_aiServiceDown_stillSaves() {
        UUID studentId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();

        when(facultyClient.getAssignmentById(assignmentId)).thenReturn(new AssignmentResponse());

        MockMultipartFile file = new MockMultipartFile(
                "file", "code.py", "text/x-python", "print('hello')".getBytes()
        );

        FileStorageService.StoredFile stored = new FileStorageService.StoredFile(
                "/uploads/code.py", com.integrityai.submission.entity.FileType.CODE
        );
        when(fileStorageService.store(any(), any())).thenReturn(stored);

        Submission saved = new Submission();
        saved.setSubmissionId(UUID.randomUUID());
        when(submissionRepository.save(any())).thenReturn(saved);

        // AI service throws — submission should still be saved
        when(aiAnalysisClient.triggerAnalysis(any())).thenThrow(new RuntimeException("AI service down"));
        when(notificationClient.createNotification(any())).thenReturn(null);

        assertThatCode(() ->
                submissionService.createSubmissionWithFile(studentId, assignmentId, file)
        ).doesNotThrowAnyException();

        verify(submissionRepository).save(any());
    }

    // =====================================================================
    // CRUD
    // =====================================================================

    @Test
    void getSubmissionById_found() {
        UUID id = UUID.randomUUID();
        Submission s = buildSubmission(id, UUID.randomUUID(), UUID.randomUUID());
        when(submissionRepository.findById(id)).thenReturn(Optional.of(s));

        Submission result = submissionService.getSubmissionById(id);
        assertThat(result.getSubmissionId()).isEqualTo(id);
    }

    @Test
    void getSubmissionById_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(submissionRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> submissionService.getSubmissionById(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getAllSubmissions_returnsList() {
        Submission s1 = buildSubmission(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        Submission s2 = buildSubmission(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        when(submissionRepository.findAll()).thenReturn(List.of(s1, s2));

        List<Submission> result = submissionService.getAllSubmissions();
        assertThat(result).hasSize(2);
    }

    @Test
    void getSubmissionsByStudent_returnsList() {
        UUID studentId = UUID.randomUUID();
        Submission s = buildSubmission(UUID.randomUUID(), studentId, UUID.randomUUID());
        when(submissionRepository.findByStudentId(studentId)).thenReturn(List.of(s));

        List<Submission> result = submissionService.getSubmissionsByStudent(studentId);
        assertThat(result).hasSize(1);
    }

    @Test
    void getSubmissionsByAssignment_excludesDrafts() {
        UUID assignmentId = UUID.randomUUID();
        Submission official = buildSubmission(UUID.randomUUID(), UUID.randomUUID(), assignmentId);
        official.setIsDraft(false);

        Submission draft = buildSubmission(UUID.randomUUID(), UUID.randomUUID(), assignmentId);
        draft.setIsDraft(true);

        when(submissionRepository.findByAssignmentId(assignmentId)).thenReturn(List.of(official, draft));

        List<Submission> result = submissionService.getSubmissionsByAssignment(assignmentId);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIsDraft()).isFalse();
    }

    @Test
    void deleteSubmission_success() {
        UUID id = UUID.randomUUID();
        when(submissionRepository.existsById(id)).thenReturn(true);
        doNothing().when(submissionRepository).deleteById(id);

        assertThatCode(() -> submissionService.deleteSubmission(id)).doesNotThrowAnyException();
    }

    @Test
    void deleteSubmission_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(submissionRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> submissionService.deleteSubmission(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }
}
