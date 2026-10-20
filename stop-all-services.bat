@echo off
TITLE IntegrityAI - Stopping All Services
echo ===================================================
echo           IntegrityAI Services Stopper
echo ===================================================
echo.

set PORTS=8761 8888 8080 8081 8082 8083 8084 8085 8090 5173

for %%P in (%PORTS%) do (
    echo Checking port %%P...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%P ^| findstr LISTENING') do (
        echo Killing process on port %%P (PID %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo All IntegrityAI microservice ports cleared.
pause
