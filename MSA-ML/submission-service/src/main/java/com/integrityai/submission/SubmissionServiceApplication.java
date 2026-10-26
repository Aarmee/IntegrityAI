package com.integrityai.submission;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class SubmissionServiceApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(SubmissionServiceApplication.class, args);
	}

	private static void loadDotEnv() {
		String[] candidatePaths = {
				".env",
				"../.env",
				"../../.env",
				System.getProperty("user.dir") + "/.env"
		};

		for (String path : candidatePaths) {
			File file = new File(path);
			if (file.exists() && file.isFile()) {
				try {
					List<String> lines = Files.readAllLines(file.toPath());
					for (String line : lines) {
						String trimmed = line.trim();
						if (trimmed.isEmpty() || trimmed.startsWith("#")) {
							continue;
						}
						int eqIdx = trimmed.indexOf('=');
						if (eqIdx > 0) {
							String key = trimmed.substring(0, eqIdx).trim();
							String value = trimmed.substring(eqIdx + 1).trim();
							if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
								value = value.substring(1, value.length() - 1);
							} else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					System.out.println("[SubmissionService] Successfully loaded environment from " + file.getCanonicalPath());
					break;
				} catch (Exception e) {
					System.err.println("[SubmissionService] Warning: Could not read .env at " + path + ": " + e.getMessage());
				}
			}
		}
	}
}