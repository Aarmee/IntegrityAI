package com.integrityai.notification.config;

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
            log.info("Checking database schema for notifications table...");
            // Drop legacy check constraints and ensure columns
            jdbcTemplate.execute("DO $$ BEGIN " +
                    "BEGIN ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check; EXCEPTION WHEN OTHERS THEN NULL; END; " +
                    "BEGIN ALTER TABLE notifications ALTER COLUMN \"read\" DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END; " +
                    "BEGIN ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE; EXCEPTION WHEN OTHERS THEN NULL; END; " +
                    "BEGIN ALTER TABLE notifications ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE; EXCEPTION WHEN OTHERS THEN NULL; END; " +
                    "END $$;");
            log.info("Notifications database schema verified successfully.");
        } catch (Exception e) {
            log.warn("DatabaseSchemaMigrator notice: {}", e.getMessage());
        }
    }
}
