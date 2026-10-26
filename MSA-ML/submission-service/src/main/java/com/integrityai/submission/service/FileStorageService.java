package com.integrityai.submission.service;

import com.integrityai.submission.entity.FileType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Handles AWS S3 Cloud Object Storage and temporary local caching for student submissions.
 *
 * Files are uploaded to:
 *   s3://{aws.s3.bucket}/submissions/{assignmentId}/{uuid}_{originalFilename}
 *
 * Supported types: PDF, DOCX, ZIP, CODE (txt, java, py, js, ts, c, cpp)
 * Max size: configurable via file.upload.max-size-bytes (default 20 MB)
 */
@Service
public class FileStorageService {

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
    private final boolean s3Enabled;
    private final String s3Bucket;
    private S3Client s3Client;

    public FileStorageService(
            @Value("${file.upload.dir:#{systemProperties['java.io.tmpdir'] + '/integrityai_uploads'}}") String uploadDir,
            @Value("${file.upload.max-size-bytes:20971520}") long maxSizeBytes,
            @Value("${aws.s3.enabled:true}") boolean s3Enabled,
            @Value("${aws.s3.bucket:integrityai-submissions-aarmee}") String s3Bucket,
            @Value("${aws.s3.region:eu-north-1}") String s3Region,
            @Value("${aws.accessKeyId:}") String accessKey,
            @Value("${aws.secretKey:}") String secretKey) {

        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxSizeBytes = maxSizeBytes;
        this.s3Bucket = s3Bucket;
        this.s3Enabled = s3Enabled && s3Bucket != null && !s3Bucket.isBlank();

        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create local temp directory: " + uploadRoot, e);
        }

        if (this.s3Enabled) {
            try {
                Region region = Region.of(s3Region != null && !s3Region.isBlank() ? s3Region : "eu-north-1");
                S3ClientBuilder builder = S3Client.builder().region(region);
                if (accessKey != null && !accessKey.isBlank() && secretKey != null && !secretKey.isBlank()) {
                    AwsBasicCredentials creds = AwsBasicCredentials.create(accessKey.trim(), secretKey.trim());
                    builder.credentialsProvider(StaticCredentialsProvider.create(creds));
                }
                this.s3Client = builder.build();
                System.out.println("[FileStorageService] AWS S3 Client initialized. Bucket: " + s3Bucket + ", Region: " + region);
            } catch (Exception e) {
                System.err.println("[FileStorageService] Warning: Could not initialize AWS S3 client: " + e.getMessage());
                this.s3Client = null;
            }
        }
    }

    public StoredFile store(MultipartFile file, UUID assignmentId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException(
                    "File exceeds maximum allowed size of " + (maxSizeBytes / 1_048_576) + " MB");
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");

        if (originalName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence: " + originalName);
        }

        String extension = extractExtension(originalName).toLowerCase();
        FileType fileTypeByExt = ALLOWED_EXTENSIONS.get(extension);
        if (fileTypeByExt == null) {
            throw new IllegalArgumentException("File extension '." + extension + "' is not supported.");
        }

        String contentType = file.getContentType();
        FileType fileTypeByMime = contentType != null ? ALLOWED_MIME_TYPES.get(contentType.toLowerCase()) : null;
        if (fileTypeByMime != null && fileTypeByMime != fileTypeByExt && !fileTypeByExt.equals(FileType.CODE)) {
            throw new IllegalArgumentException(
                    "MIME type '" + contentType + "' does not match extension '." + extension + "'");
        }

        try {
            Path assignmentDir = uploadRoot.resolve(assignmentId.toString());
            Files.createDirectories(assignmentDir);

            String storedName = UUID.randomUUID() + "_" + originalName;
            Path localTempPath = assignmentDir.resolve(storedName);

            Files.copy(file.getInputStream(), localTempPath, StandardCopyOption.REPLACE_EXISTING);

            // Upload directly to AWS S3
            if (s3Enabled && s3Client != null) {
                try {
                    String s3Key = "submissions/" + assignmentId + "/" + storedName;
                    PutObjectRequest putReq = PutObjectRequest.builder()
                            .bucket(s3Bucket)
                            .key(s3Key)
                            .contentType(contentType != null ? contentType : "application/octet-stream")
                            .build();

                    s3Client.putObject(putReq, RequestBody.fromFile(localTempPath));
                    String cloudUrl = "s3://" + s3Bucket + "/" + s3Key;
                    System.out.println("[FileStorageService] File stored on AWS S3: " + cloudUrl);
                    return new StoredFile(cloudUrl, localTempPath.toString(), fileTypeByExt);
                } catch (Exception e) {
                    System.err.println("[FileStorageService] AWS S3 upload failed (using local fallback): " + e.getMessage());
                }
            }

            return new StoredFile(localTempPath.toString(), localTempPath.toString(), fileTypeByExt);

        } catch (IOException e) {
            throw new RuntimeException("Failed to process file: " + originalName, e);
        }
    }

    public InputStream getFileStream(String fileUrl) throws IOException {
        if (fileUrl != null && fileUrl.startsWith("s3://") && s3Client != null) {
            String s3Path = fileUrl.substring(5); // strip s3://
            int slashIndex = s3Path.indexOf('/');
            String bucket = s3Path.substring(0, slashIndex);
            String key = s3Path.substring(slashIndex + 1);

            GetObjectRequest getReq = GetObjectRequest.builder().bucket(bucket).key(key).build();
            return s3Client.getObject(getReq);
        }

        Path localPath = Paths.get(fileUrl);
        if (Files.exists(localPath)) {
            return Files.newInputStream(localPath);
        }
        throw new IOException("File not found in S3 or local storage: " + fileUrl);
    }

    public void delete(String fileUrl) {
        if (fileUrl == null) return;
        try {
            if (fileUrl.startsWith("s3://") && s3Client != null) {
                String s3Path = fileUrl.substring(5);
                int slashIndex = s3Path.indexOf('/');
                String bucket = s3Path.substring(0, slashIndex);
                String key = s3Path.substring(slashIndex + 1);
                s3Client.deleteObject(b -> b.bucket(bucket).key(key));
                System.out.println("[FileStorageService] Deleted from AWS S3: " + fileUrl);
            } else {
                Files.deleteIfExists(Paths.get(fileUrl));
            }
        } catch (Exception e) {
            System.err.println("[FileStorageService] Warning: Could not delete: " + fileUrl + " — " + e.getMessage());
        }
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) return "";
        return filename.substring(dotIndex + 1);
    }

    public record StoredFile(String fileUrl, String localTempPath, FileType fileType) {
        public StoredFile(String fileUrl, FileType fileType) {
            this(fileUrl, fileUrl, fileType);
        }

        public String filePath() {
            return localTempPath != null ? localTempPath : fileUrl;
        }
    }
}
