package com.integrityai.submission.service;

import com.integrityai.submission.entity.FileType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Handles local filesystem storage for uploaded submission files.
 *
 * Files are stored under the configured upload directory:
 *   {upload.dir}/{assignmentId}/{uuid}_{originalFilename}
 *
 * The returned path string is stored as fileUrl in the Submission document
 * and later read by ai-analysis-service when extracting text content.
 *
 * Supported types: PDF, DOCX, ZIP, CODE (txt, java, py, js, ts, c, cpp, h)
 * Max size: configurable via file.upload.max-size-bytes (default 20 MB)
 */
@Service
public class FileStorageService {

    // Allowed MIME types mapped to FileType enum values
    private static final Map<String, FileType> ALLOWED_MIME_TYPES = Map.of(
            "application/pdf",                                                       FileType.PDF,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", FileType.DOCX,
            "application/zip",                                                       FileType.ZIP,
            "application/x-zip-compressed",                                          FileType.ZIP,
            "text/plain",                                                            FileType.CODE,
            "text/x-java-source",                                                    FileType.CODE,
            "text/x-python",                                                         FileType.CODE,
            "application/javascript",                                                FileType.CODE,
            "text/javascript",                                                       FileType.CODE
    );

    // Allowed file extensions mapped to FileType
    private static final Map<String, FileType> ALLOWED_EXTENSIONS = Map.of(
            "pdf",  FileType.PDF,
            "docx", FileType.DOCX,
            "zip",  FileType.ZIP,
            "txt",  FileType.CODE,
            "java", FileType.CODE,
            "py",   FileType.CODE,
            "js",   FileType.CODE,
            "ts",   FileType.CODE,
            "c",    FileType.CODE,
            "cpp",  FileType.CODE
    );

    private final Path uploadRoot;
    private final long maxSizeBytes;

    public FileStorageService(
            @Value("${file.upload.dir:#{systemProperties['java.io.tmpdir'] + '/integrityai_uploads'}}") String uploadDir,
            @Value("${file.upload.max-size-bytes:20971520}") long maxSizeBytes) {

        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxSizeBytes = maxSizeBytes;

        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not create upload directory: " + uploadRoot, e);
        }
    }

    /**
     * Validates and stores an uploaded file.
     *
     * @param file         the multipart file from the request
     * @param assignmentId scoping subdirectory
     * @return StoredFile containing the resolved path string and detected FileType
     */
    public StoredFile store(MultipartFile file, UUID assignmentId) {

        // --- Size check ---
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException(
                    "File exceeds the maximum allowed size of " + (maxSizeBytes / 1_048_576) + " MB");
        }

        // --- Filename sanitisation ---
        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");

        if (originalName.contains("..")) {
            throw new IllegalArgumentException(
                    "Filename contains invalid path sequence: " + originalName);
        }

        // --- Extension validation (first line of defense) ---
        String extension = extractExtension(originalName).toLowerCase();
        FileType fileTypeByExt = ALLOWED_EXTENSIONS.get(extension);
        if (fileTypeByExt == null) {
            throw new IllegalArgumentException(
                    "File extension '." + extension + "' is not allowed. " +
                    "Supported: pdf, docx, zip, txt, java, py, js, ts, c, cpp");
        }

        // --- MIME type validation (second line of defense — don't trust client alone) ---
        String contentType = file.getContentType();
        FileType fileTypeByMime = contentType != null
                ? ALLOWED_MIME_TYPES.get(contentType.toLowerCase())
                : null;

        // Use extension-derived type; MIME must either match or be text/* for CODE
        if (fileTypeByMime != null && fileTypeByMime != fileTypeByExt
                && !fileTypeByExt.equals(FileType.CODE)) {
            throw new IllegalArgumentException(
                    "MIME type '" + contentType + "' does not match file extension '." + extension + "'");
        }

        // --- Store ---
        try {
            Path assignmentDir = uploadRoot.resolve(assignmentId.toString());
            Files.createDirectories(assignmentDir);

            String storedName = UUID.randomUUID() + "_" + originalName;
            Path targetPath = assignmentDir.resolve(storedName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return new StoredFile(targetPath.toString(), fileTypeByExt);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalName, e);
        }
    }

    /**
     * Deletes a stored file. Silently ignores missing files.
     */
    public void delete(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException e) {
            // Log only — don't propagate on cleanup failures
            System.err.println("Warning: could not delete file: " + filePath + " — " + e.getMessage());
        }
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex + 1);
    }

    // ---- Value object returned by store() ----

    public record StoredFile(String filePath, FileType fileType) {}
}
