# Build Stage
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

ENV SERVER_PORT=8761
EXPOSE 8761

ENTRYPOINT ["java", "-jar", "-XX:+UseContainerSupport", "-Xmx384m", "app.jar"]
