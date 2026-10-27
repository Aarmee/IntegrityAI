@echo off
TITLE IntegrityAI - Starting Prometheus & Grafana Monitoring Stack
echo ========================================================
echo       Starting IntegrityAI Monitoring (Prometheus + Grafana)
echo ========================================================
echo.

docker compose -f docker-compose.monitoring.yml up -d

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  Monitoring stack successfully running!
    echo  - Prometheus Server: http://localhost:9090
    echo  - Grafana Dashboard: http://localhost:3000
    echo ========================================================
) else (
    echo.
    echo [ERROR] Failed to start Docker monitoring containers.
    echo Make sure Docker Desktop is running.
)
pause
