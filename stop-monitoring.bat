@echo off
TITLE IntegrityAI - Stopping Prometheus & Grafana Monitoring Stack
echo Stopping monitoring stack...
docker compose -f docker-compose.monitoring.yml down
echo Monitoring stack stopped.
pause
