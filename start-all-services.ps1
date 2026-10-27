# ==============================================================
# IntegrityAI - Automated Microservices Startup Script
# ==============================================================
$ErrorActionPreference = "SilentlyContinue"

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $baseDir) {
    $baseDir = "c:\Users\AARMEE\Desktop\MSA --- Project\IntegrityAI"
}
$msaDir = Join-Path $baseDir "MSA-ML"

# Load local environment configuration if present
$envLocal = Join-Path $baseDir ".env.local.bat"
if (Test-Path $envLocal) {
    cmd.exe /c "call `"$envLocal`" && set" | ForEach-Object {
        if ($_ -match "^(.*?)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Starting IntegrityAI Microservices         " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 0. Eureka Server
Write-Host "[0/8] Launching Eureka Server (8761)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title Eureka-Server-8761 && mvnw.cmd spring-boot:run" -WorkingDirectory (Join-Path $msaDir "eureka-server")
Write-Host "Waiting for Eureka Server to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 8

# 1. Auth Service
Write-Host "[1/8] Launching Auth Service (8081)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title Auth-Service-8081 && mvnw.cmd spring-boot:run" -WorkingDirectory (Join-Path $msaDir "auth-service")
Start-Sleep -Seconds 4

# 2. Faculty Service
Write-Host "[2/8] Launching Faculty Service (8082)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title Faculty-Service-8082 && mvnw.cmd spring-boot:run" -WorkingDirectory (Join-Path $msaDir "faculty-service")
Start-Sleep -Seconds 4

# 3. Notification Service
Write-Host "[3/8] Launching Notification Service (8084)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title Notification-Service-8084 && mvnw.cmd spring-boot:run" -WorkingDirectory (Join-Path $msaDir "notification-service")
Start-Sleep -Seconds 4

# 4. Submission Service
Write-Host "[4/8] Launching Submission Service (8083)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title Submission-Service-8083 && mvnw.cmd spring-boot:run" -WorkingDirectory (Join-Path $msaDir "submission-service")
Start-Sleep -Seconds 4

# 5. Report Service
Write-Host "[5/8] Launching Report Service (8085)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title Report-Service-8085 && mvnw.cmd spring-boot:run" -WorkingDirectory (Join-Path $msaDir "report-service")
Start-Sleep -Seconds 4

# 6. AI Analysis Service
$aiCheck = Get-NetTCPConnection -LocalPort 8090 -State Listen -ErrorAction SilentlyContinue
if (-not $aiCheck) {
    Write-Host "[6/8] Launching AI Analysis Service (8090)..." -ForegroundColor Yellow
    Start-Process cmd.exe -ArgumentList "/k title AI-Analysis-Service-8090 && python -m uvicorn app.main:app --host 0.0.0.0 --port 8090 --reload" -WorkingDirectory (Join-Path $msaDir "ai-analysis-service")
    Start-Sleep -Seconds 3
} else {
    Write-Host "[6/8] AI Analysis Service already active on 8090." -ForegroundColor Green
}

# 7. API Gateway
Write-Host "[7/8] Launching API Gateway (8080)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title API-Gateway-8080 && mvnw.cmd spring-boot:run" -WorkingDirectory (Join-Path $msaDir "api-gateway")
Start-Sleep -Seconds 4

# 8. Frontend
$feCheck = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if (-not $feCheck) {
    Write-Host "[8/8] Launching React Frontend (5173)..." -ForegroundColor Yellow
    Start-Process cmd.exe -ArgumentList "/k title Frontend-5173 && npm run dev" -WorkingDirectory (Join-Path $baseDir "frontend")
} else {
    Write-Host "[8/8] React Frontend already active on 5173." -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host " All services started in separate labeled windows!" -ForegroundColor Green
Write-Host " - Eureka Dashboard: http://localhost:8761" -ForegroundColor Green
Write-Host " - API Gateway:      http://localhost:8080" -ForegroundColor Green
Write-Host " - Frontend UI:      http://localhost:5173" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
