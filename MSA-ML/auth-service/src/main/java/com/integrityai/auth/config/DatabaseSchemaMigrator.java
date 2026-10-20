package com.integrityai.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaMigrator implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaMigrator.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaMigrator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Executing database schema column expansion for users table...");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN semester TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN course TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN assigned_courses TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN department TYPE VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN phone_number TYPE VARCHAR(25);");
            log.info("Database schema column expansion completed successfully.");
        } catch (Exception ex) {
            log.warn("Database schema expansion notice: {}", ex.getMessage());
        }
    }
}
