@echo off
TITLE IntegrityAI - Stopping All Docker Containers
echo ========================================================
echo     Stopping ALL IntegrityAI Services via Docker Compose
echo ========================================================
echo.

docker compose down

echo.
echo All IntegrityAI Docker containers stopped cleanly.
pause
