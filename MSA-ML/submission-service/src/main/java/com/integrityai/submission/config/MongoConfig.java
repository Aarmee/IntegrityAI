package com.integrityai.submission.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.bson.UuidRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import com.integrityai.submission.entity.FileType;
import com.integrityai.submission.entity.SubmissionStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.List;
import java.util.UUID;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database}")
    private String databaseName;

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    @Bean
    @Override
    public MongoClient mongoClient() {

        ConnectionString connectionString =
                new ConnectionString(mongoUri);

        MongoClientSettings settings =
                MongoClientSettings.builder()
                        .applyConnectionString(connectionString)
                        .uuidRepresentation(
                                UuidRepresentation.STANDARD
                        )
                        .build();

        return MongoClients.create(settings);
    }

    @Bean
    @Override
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(List.of(
                new StringToSubmissionStatusConverter(),
                new StringToFileTypeConverter()
        ));
    }

    @ReadingConverter
    public static class StringToSubmissionStatusConverter implements Converter<String, SubmissionStatus> {
        @Override
        public SubmissionStatus convert(String source) {
            if (source == null || source.isBlank()) return SubmissionStatus.UPLOADED;
            try {
                return SubmissionStatus.valueOf(source.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                if ("UPLOADED".equalsIgnoreCase(source)) return SubmissionStatus.UPLOADED;
                if ("PROCESSING".equalsIgnoreCase(source)) return SubmissionStatus.PROCESSING;
                if ("COMPLETED".equalsIgnoreCase(source) || "DONE".equalsIgnoreCase(source)) return SubmissionStatus.COMPLETED;
                if ("FAILED".equalsIgnoreCase(source)) return SubmissionStatus.FAILED;
                return SubmissionStatus.UPLOADED;
            }
        }
    }

    @ReadingConverter
    public static class StringToFileTypeConverter implements Converter<String, FileType> {
        @Override
        public FileType convert(String source) {
            if (source == null || source.isBlank()) return FileType.OTHER;
            try {
                return FileType.valueOf(source.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return FileType.OTHER;
            }
        }
    }
}