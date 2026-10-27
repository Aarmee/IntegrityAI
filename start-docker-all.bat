@echo off
TITLE IntegrityAI - Starting Full Stack via Docker
echo ========================================================
echo     Starting ALL IntegrityAI Services via Docker Compose
echo ========================================================
echo.

docker compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  All IntegrityAI Docker Containers are Running!
    echo  - Eureka Dashboard: http://localhost:8761
    echo  - API Gateway:      http://localhost:8080
    echo  - Frontend Web UI:  http://localhost:5173
    echo  - Prometheus:       http://localhost:9090
    echo  - Grafana:          http://localhost:3000
    echo ========================================================
) else (
    echo.
    echo [ERROR] Failed to start Docker containers.
    echo Make sure Docker Desktop is running.
)
pause
