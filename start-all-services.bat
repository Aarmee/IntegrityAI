@echo off
TITLE IntegrityAI - Starting All Microservices
echo ===================================================
echo           IntegrityAI Microservices Starter
echo ===================================================
echo.

set PROJECT_ROOT=%~dp0
set MSA_ROOT=%PROJECT_ROOT%MSA-ML
if exist "%PROJECT_ROOT%.env.local.bat" call "%PROJECT_ROOT%.env.local.bat"

echo [1/7] Starting Auth Service on port 8081...
start "IntegrityAI - Auth Service (8081)" /D "%MSA_ROOT%\auth-service" cmd /k mvnw.cmd spring-boot:run
ping 127.0.0.1 -n 4 >nul

echo [2/7] Starting Faculty Service on port 8082...
start "IntegrityAI - Faculty Service (8082)" /D "%MSA_ROOT%\faculty-service" cmd /k mvnw.cmd spring-boot:run
ping 127.0.0.1 -n 4 >nul

echo [3/7] Starting Notification Service on port 8084...
start "IntegrityAI - Notification Service (8084)" /D "%MSA_ROOT%\notification-service" cmd /k mvnw.cmd spring-boot:run
ping 127.0.0.1 -n 4 >nul

echo [4/7] Starting Submission Service on port 8083...
start "IntegrityAI - Submission Service (8083)" /D "%MSA_ROOT%\submission-service" cmd /k mvnw.cmd spring-boot:run
ping 127.0.0.1 -n 4 >nul

echo [5/7] Starting Report Service on port 8085...
start "IntegrityAI - Report Service (8085)" /D "%MSA_ROOT%\report-service" cmd /k mvnw.cmd spring-boot:run
ping 127.0.0.1 -n 4 >nul

netstat -ano | findstr :8090 | findstr LISTENING >nul
if errorlevel 1 (
    echo [6/7] Starting AI Analysis Service on port 8090...
    start "IntegrityAI - AI Analysis Service (8090)" /D "%MSA_ROOT%\ai-analysis-service" cmd /k python -m uvicorn app.main:app --host 0.0.0.0 --port 8090 --reload
    ping 127.0.0.1 -n 3 >nul
) else (
    echo [6/7] AI Analysis Service already running on port 8090.
)

echo [7/7] Starting API Gateway on port 8080...
start "IntegrityAI - API Gateway (8080)" /D "%MSA_ROOT%\api-gateway" cmd /k mvnw.cmd spring-boot:run
ping 127.0.0.1 -n 4 >nul

netstat -ano | findstr :5173 | findstr LISTENING >nul
if errorlevel 1 (
    echo Starting React Frontend on port 5173...
    start "IntegrityAI - Frontend (5173)" /D "%PROJECT_ROOT%frontend" cmd /k npm run dev
) else (
    echo Frontend already running on port 5173.
)

echo.
echo ===================================================
echo Microservices launched in individual windows!
echo - API Gateway:  http://localhost:8080
echo - Frontend UI:  http://localhost:5173
echo ===================================================
