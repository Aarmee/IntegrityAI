package com.integrityai.faculty.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrityai.faculty.entity.Assignment;
import com.integrityai.faculty.repository.AssignmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DeadlineReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(DeadlineReminderScheduler.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");

    private final AssignmentRepository assignmentRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    // Track reminders sent: key = assignmentId + "_" + studentId + "_" + window
    private final Set<String> sentAlertKeys = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public DeadlineReminderScheduler(AssignmentRepository assignmentRepository, ObjectMapper objectMapper) {
        this.assignmentRepository = assignmentRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
    }

    /**
     * Runs periodically every 60 seconds to scan active assignment deadlines.
     */
    @Scheduled(fixedRate = 60000)
    public void scanAndDispatchDeadlineReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Assignment> activeAssignments = assignmentRepository.findAll();

            for (Assignment a : activeAssignments) {
                if (a.getDeadline() == null) {
                    continue;
                }

                if (a.getDeadline().isBefore(now)) {
                    // Deadline has crossed! Send faculty summary report if not already sent
                    String summaryKey = a.getAssignmentId() + "_FACULTY_SUMMARY";
                    if (!sentAlertKeys.contains(summaryKey)) {
                        long minutesPast = Duration.between(a.getDeadline(), now).toMinutes();
                        // Send summary for deadlines passed within last 48 hours
                        if (minutesPast <= 2880) {
                            sendPostDeadlineSummaryToFaculty(a);
                            sentAlertKeys.add(summaryKey);
                        }
                    }
                    continue;
                }

                long minutesRemaining = Duration.between(now, a.getDeadline()).toMinutes();
                if (minutesRemaining <= 0 || minutesRemaining > 1440) {
                    continue; // Beyond 24 hours
                }

                String window = resolveWindow(minutesRemaining);
                if (window == null) {
                    continue;
                }

                String timeRemainingLabel = formatTimeRemaining(minutesRemaining);
                dispatchAlertsForAssignment(a, window, timeRemainingLabel);
            }
        } catch (Exception e) {
            log.error("[DeadlineReminderScheduler] Error running deadline check: {}", e.getMessage());
        }
    }

    /**
     * Manually triggers deadline reminder for all pending students of a specific assignment.
     * @return count of reminder emails dispatched
     */
    public int triggerManualReminders(UUID assignmentId) {
        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        LocalDateTime now = LocalDateTime.now();
        long minutesRemaining = a.getDeadline() != null && a.getDeadline().isAfter(now)
                ? Duration.between(now, a.getDeadline()).toMinutes()
                : 0;

        String timeRemainingLabel = minutesRemaining > 0 
                ? formatTimeRemaining(minutesRemaining) 
                : "Deadline Passed / Immediate submission required";

        return dispatchAlertsForAssignment(a, "MANUAL_" + System.currentTimeMillis(), timeRemainingLabel);
    }

    public boolean triggerFacultySummary(UUID assignmentId) {
        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        return sendPostDeadlineSummaryToFaculty(a);
    }

    public boolean sendPostDeadlineSummaryToFaculty(Assignment assignment) {
        try {
            log.info("[DeadlineReminderScheduler] Generating post-deadline summary for assignment: {}", assignment.getTitle());

            // 1. Fetch eligible students for this assignment's course & semester
            List<JsonNode> eligibleStudents = fetchEligibleStudents(assignment);

            // 2. Fetch submissions for this assignment from submission-service
            List<JsonNode> rawSubmissions = fetchRawSubmissions(assignment.getAssignmentId());

            Map<UUID, JsonNode> submissionMap = new HashMap<>();
            for (JsonNode sub : rawSubmissions) {
                boolean isDraft = sub.path("isDraft").asBoolean(false);
                if (!isDraft) {
                    String sid = sub.path("studentId").asText(null);
                    if (sid != null) {
                        submissionMap.put(UUID.fromString(sid), sub);
                    }
                }
            }

            // 3. Separate into Submitted vs Pending Students
            List<Map<String, String>> submittedRows = new ArrayList<>();
            List<Map<String, String>> missingRows = new ArrayList<>();

            for (JsonNode student : eligibleStudents) {
                String sidStr = student.path("userId").asText("");
                String studentName = student.path("name").asText("Unknown Student");
                String rollNumber = student.path("rollNumber").asText("N/A");
                String studentEmail = student.path("email").asText("N/A");

                if (sidStr.isBlank()) continue;
                UUID sid = UUID.fromString(sidStr);

                if (submissionMap.containsKey(sid)) {
                    JsonNode sub = submissionMap.get(sid);
                    String submittedAtStr = sub.path("submittedAt").asText("");
                    submittedRows.add(Map.of(
                            "name", studentName,
                            "rollNumber", rollNumber,
                            "submittedAt", submittedAtStr.length() > 16 ? submittedAtStr.substring(0, 16).replace('T', ' ') : submittedAtStr,
                            "status", sub.path("status").asText("COMPLETED")
                    ));
                } else {
                    missingRows.add(Map.of(
                            "name", studentName,
                            "rollNumber", rollNumber,
                            "email", studentEmail
                    ));
                }
            }

            // Also check any submissions from students that might not have matched course filter
            for (Map.Entry<UUID, JsonNode> entry : submissionMap.entrySet()) {
                boolean alreadyListed = submittedRows.stream()
                        .anyMatch(r -> r.get("name").equalsIgnoreCase(entry.getValue().path("studentName").asText(""))
                                || r.get("rollNumber").equals(entry.getValue().path("rollNumber").asText("")));
                if (!alreadyListed) {
                    JsonNode sub = entry.getValue();
                    String sname = sub.path("studentName").asText("Student");
                    String roll = sub.path("rollNumber").asText("N/A");
                    String subTime = sub.path("submittedAt").asText("");
                    submittedRows.add(Map.of(
                            "name", sname,
                            "rollNumber", roll,
                            "submittedAt", subTime.length() > 16 ? subTime.substring(0, 16).replace('T', ' ') : subTime,
                            "status", sub.path("status").asText("COMPLETED")
                    ));
                }
            }

            // 4. Find faculty email
            String facultyEmail = fetchFacultyEmail(assignment.getFacultyId());
            String deadlineStr = assignment.getDeadline() != null
                    ? assignment.getDeadline().format(FORMATTER)
                    : "Cutoff Passed";

            // 5. Build rich HTML roll-call summary
            String htmlBody = buildFacultySummaryHtml(assignment, deadlineStr, submittedRows, missingRows);

            // 6. Dispatch to notification-service
            return dispatchFacultySummaryEmail(
                    assignment.getFacultyId(),
                    facultyEmail,
                    "Course Instructor",
                    assignment.getTitle(),
                    assignment.getTargetCourse() != null ? assignment.getTargetCourse() : "All Programs",
                    assignment.getTargetSemester() != null ? assignment.getTargetSemester() : "All Semesters",
                    deadlineStr,
                    htmlBody
            );

        } catch (Exception e) {
            log.error("[DeadlineReminderScheduler] Error compiling faculty summary: {}", e.getMessage(), e);
            return false;
        }
    }

    private List<JsonNode> fetchRawSubmissions(UUID assignmentId) {
        List<JsonNode> list = new ArrayList<>();
        try {
            String url = System.getenv().getOrDefault("SUBMISSION_SERVICE_URL", "http://localhost:8083")
                    + "/api/submissions/assignment/" + assignmentId;

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-Internal-Service", "faculty-service")
                    .GET()
                    .timeout(Duration.ofSeconds(4))
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                JsonNode array = objectMapper.readTree(resp.body());
                if (array.isArray()) {
                    for (JsonNode n : array) list.add(n);
                }
            }
        } catch (Exception e) {
            log.warn("[DeadlineReminderScheduler] Error fetching raw submissions: {}", e.getMessage());
        }
        return list;
    }

    private String fetchFacultyEmail(UUID facultyId) {
        if (facultyId != null) {
            try {
                String url = System.getenv().getOrDefault("AUTH_SERVICE_URL", "http://localhost:8081")
                        + "/api/users/" + facultyId;

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("X-Internal-Service", "faculty-service")
                        .GET()
                        .timeout(Duration.ofSeconds(3))
                        .build();

                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() == 200) {
                    JsonNode node = objectMapper.readTree(resp.body());
                    String email = node.path("email").asText(null);
                    if (email != null && !email.isBlank()) {
                        return email;
                    }
                }
            } catch (Exception e) {
                log.warn("[DeadlineReminderScheduler] Could not fetch faculty email: {}", e.getMessage());
            }
        }
        return "patelaarmee06@gmail.com";
    }

    private String buildFacultySummaryHtml(Assignment a, String deadlineStr,
                                          List<Map<String, String>> submitted,
                                          List<Map<String, String>> missing) {
        int total = submitted.size() + missing.size();
        int subCount = submitted.size();
        int missCount = missing.size();
        int rate = total > 0 ? (int) Math.round((double) subCount / total * 100) : 0;

        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;line-height:1.5;\">");
        sb.append("<p style=\"font-size:14px;color:#3f3f46;\">Dear Course Instructor,</p>");
        sb.append("<p style=\"font-size:14px;color:#3f3f46;\">The submission deadline for <strong>").append(a.getTitle()).append("</strong> has now closed. Below is your official student roll-call report:</p>");

        // Key Metadata Table
        sb.append("<table style=\"width:100%;border-collapse:collapse;margin:16px 0;background:#f9fafb;border-radius:10px;padding:12px;border:1px solid #e5e7eb;\">");
        sb.append("<tr><td style=\"padding:6px 12px;font-size:12px;color:#6b7280;\">Program / Course:</td><td style=\"padding:6px 12px;font-size:13px;font-weight:700;\">").append(a.getTargetCourse() != null ? a.getTargetCourse() : "All Programs").append("</td></tr>");
        sb.append("<tr><td style=\"padding:6px 12px;font-size:12px;color:#6b7280;\">Target Semester:</td><td style=\"padding:6px 12px;font-size:13px;font-weight:700;\">Semester ").append(a.getTargetSemester() != null ? a.getTargetSemester() : "All").append("</td></tr>");
        sb.append("<tr><td style=\"padding:6px 12px;font-size:12px;color:#6b7280;\">Cutoff Deadline:</td><td style=\"padding:6px 12px;font-size:13px;font-weight:700;color:#dc2626;\">").append(deadlineStr).append("</td></tr>");
        sb.append("<tr><td style=\"padding:6px 12px;font-size:12px;color:#6b7280;\">Submission Metric:</td><td style=\"padding:6px 12px;font-size:13px;font-weight:700;\">").append(subCount).append(" Submitted / ").append(missCount).append(" Pending (").append(rate).append("% Completion)</td></tr>");
        sb.append("</table>");

        // Submitted Students Section
        sb.append("<h3 style=\"font-size:14px;color:#15803d;margin-top:24px;border-bottom:2px solid #bbf7d0;padding-bottom:6px;\">✅ Submitted Students (").append(subCount).append(")</h3>");
        if (submitted.isEmpty()) {
            sb.append("<p style=\"font-size:12px;color:#6b7280;font-style:italic;\">No student submissions were received prior to the deadline.</p>");
        } else {
            sb.append("<table style=\"width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;text-align:left;\">");
            sb.append("<tr style=\"background:#f3f4f6;color:#374151;\"><th style=\"padding:8px 10px;border-bottom:1px solid #e5e7eb;\">Roll No</th><th style=\"padding:8px 10px;border-bottom:1px solid #e5e7eb;\">Student Name</th><th style=\"padding:8px 10px;border-bottom:1px solid #e5e7eb;\">Submission Time</th><th style=\"padding:8px 10px;border-bottom:1px solid #e5e7eb;\">Status</th></tr>");
            for (Map<String, String> row : submitted) {
                sb.append("<tr>");
                sb.append("<td style=\"padding:8px 10px;border-bottom:1px solid #f3f4f6;font-family:monospace;font-weight:700;\">").append(row.get("rollNumber")).append("</td>");
                sb.append("<td style=\"padding:8px 10px;border-bottom:1px solid #f3f4f6;\">").append(row.get("name")).append("</td>");
                sb.append("<td style=\"padding:8px 10px;border-bottom:1px solid #f3f4f6;color:#6b7280;\">").append(row.get("submittedAt")).append("</td>");
                sb.append("<td style=\"padding:8px 10px;border-bottom:1px solid #f3f4f6;color:#15803d;font-weight:700;\">").append(row.get("status")).append("</td>");
                sb.append("</tr>");
            }
            sb.append("</table>");
        }

        // Missing / Pending Students Section
        sb.append("<h3 style=\"font-size:14px;color:#b91c1c;margin-top:28px;border-bottom:2px solid #fecaca;padding-bottom:6px;\">⚠️ Missing / Not Submitted (").append(missCount).append(")</h3>");
        if (missing.isEmpty()) {
            sb.append("<p style=\"font-size:12px;color:#15803d;font-weight:600;\">Outstanding! All enrolled students completed their submissions on time.</p>");
        } else {
            sb.append("<table style=\"width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;text-align:left;\">");
            sb.append("<tr style=\"background:#fef2f2;color:#991b1b;\"><th style=\"padding:8px 10px;border-bottom:1px solid #fee2e2;\">Roll No</th><th style=\"padding:8px 10px;border-bottom:1px solid #fee2e2;\">Student Name</th><th style=\"padding:8px 10px;border-bottom:1px solid #fee2e2;\">Email</th></tr>");
            for (Map<String, String> row : missing) {
                sb.append("<tr>");
                sb.append("<td style=\"padding:8px 10px;border-bottom:1px solid #fef2f2;font-family:monospace;font-weight:700;\">").append(row.get("rollNumber")).append("</td>");
                sb.append("<td style=\"padding:8px 10px;border-bottom:1px solid #fef2f2;\">").append(row.get("name")).append("</td>");
                sb.append("<td style=\"padding:8px 10px;border-bottom:1px solid #fef2f2;color:#6b7280;\">").append(row.get("email")).append("</td>");
                sb.append("</tr>");
            }
            sb.append("</table>");
        }

        sb.append("</div>");
        return sb.toString();
    }

    private boolean dispatchFacultySummaryEmail(UUID facultyId, String facultyEmail, String facultyName,
                                               String assignmentTitle, String course, String semester,
                                               String deadlineStr, String htmlBody) {
        try {
            String baseUrl = System.getenv().getOrDefault("NOTIFICATION_SERVICE_URL", "http://localhost:8084")
                    + "/api/notifications/faculty-summary";

            String query = String.format("?facultyId=%s&facultyEmail=%s&facultyName=%s&assignmentTitle=%s&course=%s&semester=%s&deadline=%s",
                    facultyId != null ? facultyId : UUID.randomUUID(),
                    URLEncoder.encode(facultyEmail, StandardCharsets.UTF_8),
                    URLEncoder.encode(facultyName, StandardCharsets.UTF_8),
                    URLEncoder.encode(assignmentTitle, StandardCharsets.UTF_8),
                    URLEncoder.encode(course, StandardCharsets.UTF_8),
                    URLEncoder.encode(semester, StandardCharsets.UTF_8),
                    URLEncoder.encode(deadlineStr, StandardCharsets.UTF_8));

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + query))
                    .header("X-Internal-Service", "faculty-service")
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .POST(HttpRequest.BodyPublishers.ofString(htmlBody))
                    .timeout(Duration.ofSeconds(5))
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            return resp.statusCode() == 200 || resp.statusCode() == 201;
        } catch (Exception e) {
            log.error("[DeadlineReminderScheduler] Error dispatching faculty summary email: {}", e.getMessage());
            return false;
        }
    }

    private int dispatchAlertsForAssignment(Assignment assignment, String window, String timeRemainingLabel) {
        int sentCount = 0;
        try {
            // 1. Fetch all student users from auth-service
            List<JsonNode> eligibleStudents = fetchEligibleStudents(assignment);

            // 2. Fetch existing submissions from submission-service
            Set<UUID> submittedStudentIds = fetchSubmittedStudentIds(assignment.getAssignmentId());

            // 3. For each eligible student who has NOT submitted:
            for (JsonNode student : eligibleStudents) {
                String studentIdStr = student.path("userId").asText(null);
                if (studentIdStr == null) continue;

                UUID studentId = UUID.fromString(studentIdStr);

                // If already submitted official work, skip!
                if (submittedStudentIds.contains(studentId)) {
                    continue;
                }

                String alertKey = assignment.getAssignmentId() + "_" + studentId + "_" + window;
                if (sentAlertKeys.contains(alertKey)) {
                    continue; // Already notified in this window
                }

                String studentEmail = student.path("email").asText(null);
                String deadlineStr = assignment.getDeadline().format(FORMATTER);

                boolean sent = sendEmailReminder(
                        studentId,
                        studentEmail,
                        assignment.getTitle(),
                        deadlineStr,
                        timeRemainingLabel
                );

                if (sent) {
                    sentAlertKeys.add(alertKey);
                    sentCount++;
                }
            }
        } catch (Exception e) {
            log.error("[DeadlineReminderScheduler] Error dispatching alerts for assignment {}: {}",
                    assignment.getAssignmentId(), e.getMessage());
        }
        return sentCount;
    }

    private List<JsonNode> fetchEligibleStudents(Assignment a) {
        List<JsonNode> result = new ArrayList<>();
        try {
            String url = System.getenv().getOrDefault("AUTH_SERVICE_URL", "http://localhost:8081") + "/api/users";
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-Internal-Service", "faculty-service")
                    .GET()
                    .timeout(Duration.ofSeconds(3))
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                JsonNode array = objectMapper.readTree(resp.body());
                if (array.isArray()) {
                    for (JsonNode u : array) {
                        String role = u.path("role").asText("");
                        if (!"STUDENT".equalsIgnoreCase(role)) continue;

                        String studentCourse = u.path("course").asText("");
                        String studentSem = u.path("semester").asText("");

                        // Match course
                        boolean courseMatch = a.getTargetCourse() == null ||
                                a.getTargetCourse().isBlank() ||
                                "All Programs".equalsIgnoreCase(a.getTargetCourse()) ||
                                studentCourse.toLowerCase().contains(a.getTargetCourse().toLowerCase()) ||
                                a.getTargetCourse().toLowerCase().contains(studentCourse.toLowerCase());

                        // Match semester
                        boolean semMatch = a.getTargetSemester() == null ||
                                a.getTargetSemester().isBlank() ||
                                "All Semesters".equalsIgnoreCase(a.getTargetSemester()) ||
                                studentSem.toLowerCase().contains(a.getTargetSemester().toLowerCase()) ||
                                a.getTargetSemester().toLowerCase().contains(studentSem.toLowerCase());

                        if (courseMatch && semMatch) {
                            result.add(u);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[DeadlineReminderScheduler] Could not fetch users from auth-service: {}", e.getMessage());
        }
        return result;
    }

    private Set<UUID> fetchSubmittedStudentIds(UUID assignmentId) {
        Set<UUID> set = new HashSet<>();
        try {
            String url = System.getenv().getOrDefault("SUBMISSION_SERVICE_URL", "http://localhost:8083")
                    + "/api/submissions/assignment/" + assignmentId;

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-Internal-Service", "faculty-service")
                    .GET()
                    .timeout(Duration.ofSeconds(3))
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                JsonNode array = objectMapper.readTree(resp.body());
                if (array.isArray()) {
                    for (JsonNode sub : array) {
                        boolean isDraft = sub.path("isDraft").asBoolean(false);
                        // Only count official final submissions (not draft)
                        if (!isDraft) {
                            String sid = sub.path("studentId").asText(null);
                            if (sid != null) set.add(UUID.fromString(sid));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[DeadlineReminderScheduler] Could not fetch submissions from submission-service: {}", e.getMessage());
        }
        return set;
    }

    private boolean sendEmailReminder(UUID studentId, String studentEmail, String title, String deadlineStr, String timeRemaining) {
        try {
            String baseUrl = System.getenv().getOrDefault("NOTIFICATION_SERVICE_URL", "http://localhost:8084")
                    + "/api/notifications/reminders/send-deadline-reminder";

            String query = String.format("?studentId=%s&assignmentTitle=%s&deadline=%s&timeRemaining=%s",
                    studentId,
                    URLEncoder.encode(title, StandardCharsets.UTF_8),
                    URLEncoder.encode(deadlineStr, StandardCharsets.UTF_8),
                    URLEncoder.encode(timeRemaining, StandardCharsets.UTF_8));

            if (studentEmail != null && !studentEmail.isBlank()) {
                query += "&studentEmail=" + URLEncoder.encode(studentEmail, StandardCharsets.UTF_8);
            }

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + query))
                    .header("X-Internal-Service", "faculty-service")
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .timeout(Duration.ofSeconds(3))
                    .build();

            HttpResponse<Void> resp = httpClient.send(req, HttpResponse.BodyHandlers.discarding());
            return resp.statusCode() == 200 || resp.statusCode() == 201;
        } catch (Exception e) {
            log.warn("[DeadlineReminderScheduler] Notification dispatch skipped: {}", e.getMessage());
            return false;
        }
    }

    private String resolveWindow(long minutes) {
        if (minutes <= 10) return "10_MIN";
        if (minutes <= 30) return "30_MIN";
        if (minutes <= 60) return "1_HOUR";
        if (minutes <= 1440) return "24_HOUR";
        return null;
    }

    private String formatTimeRemaining(long minutes) {
        if (minutes < 1) return "Less than 1 minute";
        if (minutes < 60) return minutes + " minutes";
        long hours = minutes / 60;
        long remMin = minutes % 60;
        if (remMin == 0) return hours + (hours == 1 ? " hour" : " hours");
        return hours + (hours == 1 ? " hour " : " hours ") + remMin + " mins";
    }
}
