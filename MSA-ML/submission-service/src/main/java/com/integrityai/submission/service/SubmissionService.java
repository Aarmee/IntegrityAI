package com.integrityai.submission.service;

import com.integrityai.submission.client.AiAnalysisClient;
import com.integrityai.submission.client.FacultyClient;
import com.integrityai.submission.client.NotificationClient;
import com.integrityai.submission.dto.AnalysisRequest;
import com.integrityai.submission.dto.AnalysisResponse;
import com.integrityai.submission.dto.NotificationRequest;
import com.integrityai.submission.entity.Submission;
import com.integrityai.submission.entity.SubmissionStatus;
import com.integrityai.submission.repository.SubmissionRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final FacultyClient facultyClient;
    private final FileStorageService fileStorageService;
    private final AiAnalysisClient aiAnalysisClient;
    private final NotificationClient notificationClient;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            FacultyClient facultyClient,
            FileStorageService fileStorageService,
            AiAnalysisClient aiAnalysisClient,
            NotificationClient notificationClient) {

        this.submissionRepository = submissionRepository;
        this.facultyClient = facultyClient;
        this.fileStorageService = fileStorageService;
        this.aiAnalysisClient = aiAnalysisClient;
        this.notificationClient = notificationClient;
    }

    // ============================================================
    // UPLOAD FILE + CREATE SUBMISSION (primary flow)
    // ============================================================

    public Submission createSubmissionWithFile(
            UUID studentId,
            UUID assignmentId,
            MultipartFile file) {
        return createSubmissionWithFile(studentId, assignmentId, file, null, null, null, null, false);
    }

    public Submission createSubmissionWithFile(
            UUID studentId,
            UUID assignmentId,
            MultipartFile file,
            String studentName,
            String rollNumber,
            String course,
            String semester,
            Boolean isDraft) {

        // Verify the assignment exists
        facultyClient.getAssignmentById(assignmentId);

        // Store file and detect type
        FileStorageService.StoredFile stored =
                fileStorageService.store(file, assignmentId);

        // Fallback: If studentName or rollNumber wasn't passed by client, auto-resolve from auth-service
        if ((studentName == null || rollNumber == null) && studentId != null) {
            try {
                String authUrl = System.getenv().getOrDefault("AUTH_SERVICE_URL", "http://localhost:8081");
                java.net.http.HttpClient httpClient = java.net.http.HttpClient.newHttpClient();
                java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(authUrl + "/api/users/" + studentId))
                        .GET()
                        .timeout(java.time.Duration.ofSeconds(3))
                        .build();
                java.net.http.HttpResponse<String> resp = httpClient.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() == 200 && resp.body() != null) {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(resp.body());
                    if (studentName == null && root.has("name") && !root.get("name").isNull()) {
                        studentName = root.get("name").asText(null);
                    }
                    if (rollNumber == null && root.has("rollNumber") && !root.get("rollNumber").isNull()) {
                        rollNumber = root.get("rollNumber").asText(null);
                    }
                    if (course == null && root.has("course") && !root.get("course").isNull()) {
                        course = root.get("course").asText(null);
                    }
                    if (semester == null && root.has("semester") && !root.get("semester").isNull()) {
                        semester = root.get("semester").asText(null);
                    }
                }
            } catch (Exception e) {
                System.err.println("[SubmissionService] Warning: Could not auto-resolve student profile: " + e.getMessage());
            }
        }

        Submission submission = new Submission();
        submission.setSubmissionId(UUID.randomUUID());
        submission.setStudentId(studentId);
        submission.setAssignmentId(assignmentId);
        submission.setFileType(stored.fileType());
        submission.setFileUrl(stored.filePath());
        submission.setStatus(SubmissionStatus.PROCESSING);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStudentName(studentName);
        submission.setRollNumber(rollNumber);
        submission.setCourse(course);
        submission.setSemester(semester);
        submission.setIsDraft(isDraft != null ? isDraft : false);

        Submission saved = submissionRepository.save(submission);

        // Trigger AI analysis (best-effort)
        triggerAnalysis(saved);

        // Notify student that submission was received (best-effort)
        String notifTitle = Boolean.TRUE.equals(isDraft) ? "Draft Uploaded for Pre-Flight Scan" : "Submission Received";
        String notifMsg = Boolean.TRUE.equals(isDraft)
                ? "Your draft has been uploaded and is being analyzed. You can review the report before finalizing."
                : "Your submission for assignment " + assignmentId + " has been received and is being analysed.";

        sendNotification(studentId, "SUBMISSION_RECEIVED", notifTitle, notifMsg);

        return saved;
    }

    public Submission confirmSubmission(UUID id) {
        Submission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + id));
        sub.setIsDraft(false);
        sub.setStatus(SubmissionStatus.COMPLETED);

        // Fallback: Ensure student details are present when confirming submission
        if ((sub.getStudentName() == null || sub.getRollNumber() == null) && sub.getStudentId() != null) {
            try {
                String authUrl = System.getenv().getOrDefault("AUTH_SERVICE_URL", "http://localhost:8081");
                java.net.http.HttpClient httpClient = java.net.http.HttpClient.newHttpClient();
                java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(authUrl + "/api/users/" + sub.getStudentId()))
                        .GET()
                        .timeout(java.time.Duration.ofSeconds(3))
                        .build();
                java.net.http.HttpResponse<String> resp = httpClient.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() == 200 && resp.body() != null) {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(resp.body());
                    if (sub.getStudentName() == null && root.has("name") && !root.get("name").isNull()) {
                        sub.setStudentName(root.get("name").asText(null));
                    }
                    if (sub.getRollNumber() == null && root.has("rollNumber") && !root.get("rollNumber").isNull()) {
                        sub.setRollNumber(root.get("rollNumber").asText(null));
                    }
                    if (sub.getCourse() == null && root.has("course") && !root.get("course").isNull()) {
                        sub.setCourse(root.get("course").asText(null));
                    }
                    if (sub.getSemester() == null && root.has("semester") && !root.get("semester").isNull()) {
                        sub.setSemester(root.get("semester").asText(null));
                    }
                }
            } catch (Exception e) {
                System.err.println("[SubmissionService] Warning: Could not auto-resolve student details on confirm: " + e.getMessage());
            }
        }

        Submission saved = submissionRepository.save(sub);

        try {
            com.integrityai.submission.dto.AssignmentResponse assignment = facultyClient.getAssignmentById(sub.getAssignmentId());
            if (assignment != null && assignment.getFacultyId() != null) {
                String studentName = sub.getStudentName() != null ? sub.getStudentName() : "Student";
                String rollNo = sub.getRollNumber() != null ? " (" + sub.getRollNumber() + ")" : "";
                String title = "New Coursework Submission: " + assignment.getTitle();
                String msg = "Student " + studentName + rollNo + " has submitted coursework for '"
                        + assignment.getTitle() + "'. You can review the submission and integrity report in your Faculty portal.";
                sendNotification(assignment.getFacultyId(), "SUBMISSION_RECEIVED", title, msg);
            }
        } catch (Exception e) {
            System.err.println("[SubmissionService] Warning: Could not dispatch faculty submission alert: " + e.getMessage());
        }

        return saved;
    }

    // ============================================================
    // CREATE (metadata-only — kept for backward compat / internal use)
    // ============================================================

    public Submission createSubmission(Submission submission) {
        facultyClient.getAssignmentById(submission.getAssignmentId());
        submission.setSubmissionId(UUID.randomUUID());
        submission.setStatus(SubmissionStatus.UPLOADED);
        submission.setSubmittedAt(LocalDateTime.now());
        return submissionRepository.save(submission);
    }

    // GET ALL
    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    // GET BY ID
    public Submission getSubmissionById(UUID id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + id));
    }

    // GET BY STUDENT
    public List<Submission> getSubmissionsByStudent(UUID studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    // GET BY ASSIGNMENT (Excludes pre-flight drafts so faculty only sees confirmed official submissions)
    public List<Submission> getSubmissionsByAssignment(UUID assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDraft()))
                .toList();
    }

    // UPDATE
    public Submission updateSubmission(UUID id, Submission updatedSubmission) {
        Submission existing = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + id));

        if (updatedSubmission.getAssignmentId() != null) {
            facultyClient.getAssignmentById(updatedSubmission.getAssignmentId());
        }

        existing.setStudentId(updatedSubmission.getStudentId());
        existing.setAssignmentId(updatedSubmission.getAssignmentId());
        existing.setFileType(updatedSubmission.getFileType());
        existing.setFileUrl(updatedSubmission.getFileUrl());

        if (updatedSubmission.getStatus() != null) {
            existing.setStatus(updatedSubmission.getStatus());
        }
        return submissionRepository.save(existing);
    }

    // DELETE
    public void deleteSubmission(UUID id) {
        if (!submissionRepository.existsById(id)) {
            throw new RuntimeException("Submission not found with ID: " + id);
        }
        submissionRepository.deleteById(id);
    }

    public Submission updateStatus(UUID id, SubmissionStatus status) {
        Submission existing = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + id));
        existing.setStatus(status);
        return submissionRepository.save(existing);
    }

    // ============================================================
    // FILE DOWNLOAD & PREVIEW
    // ============================================================

    public record FileDownloadResult(Resource resource, String filename, String contentType) {}

    public FileDownloadResult getFileDownload(UUID id) {
        Submission sub = getSubmissionById(id);
        if (sub.getFileUrl() == null || sub.getFileUrl().isBlank()) {
            throw new RuntimeException("No file URL associated with submission " + id);
        }
        Path path = Paths.get(sub.getFileUrl());
        if (!Files.exists(path)) {
            throw new RuntimeException("Submission file not found on disk: " + path.getFileName());
        }
        Resource resource = new FileSystemResource(path);
        String rawName = path.getFileName().toString();
        String originalName = rawName.contains("_") ? rawName.substring(rawName.indexOf('_') + 1) : rawName;
        String contentType = determineContentType(originalName);
        return new FileDownloadResult(resource, originalName, contentType);
    }

    private String determineContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".zip")) return "application/zip";
        if (lower.endsWith(".txt") || lower.endsWith(".java") || lower.endsWith(".py") || lower.endsWith(".js") || lower.endsWith(".ts")) return "text/plain";
        return "application/octet-stream";
    }

    // ============================================================
    // Private helpers
    // ============================================================

    private void triggerAnalysis(Submission submission) {
        try {
            AnalysisRequest request = new AnalysisRequest(
                    submission.getSubmissionId().toString(),
                    null,
                    submission.getFileUrl(),
                    submission.getStudentId() != null ? submission.getStudentId().toString() : null,
                    submission.getAssignmentId() != null ? submission.getAssignmentId().toString() : null
            );
    
            AnalysisResponse resp = aiAnalysisClient.triggerAnalysis(request);
            if (resp != null && ("COMPLETED".equalsIgnoreCase(resp.getStatus()) || "SUCCESS".equalsIgnoreCase(resp.getStatus()))) {
                submission.setStatus(SubmissionStatus.COMPLETED);
                submissionRepository.save(submission);
            }
        } catch (Exception e) {
            System.err.println(
                    "[SubmissionService] Warning: could not reach ai-analysis-service for submission "
                    + submission.getSubmissionId() + ": " + e.getMessage()
            );
    
        }
    }

    private void sendNotification(UUID recipientId, String type, String title, String message) {
        try {
            notificationClient.createNotification(
                    new NotificationRequest(recipientId, type, title, message)
            );
    
        } catch (Exception e) {
            System.err.println(
                    "[SubmissionService] Warning: could not reach notification-service: " + e.getMessage()
            );
    
        }
    }
}
