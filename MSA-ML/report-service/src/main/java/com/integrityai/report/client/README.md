# Report Service — Feign Client Layer

## 🎯 Purpose of this Package
Implements OpenFeign HTTP clients connecting `report-service` to:
1. `ai-analysis-service`: To trigger re-scans or fetch raw sentence-by-sentence similarity metrics.
2. `notification-service`: To notify professors and students when an audit report is generated or reviewed.

---

## 📄 Files in this Package

### 1. `AiAnalysisClient.java`
- Declarative Feign client targeting `ai-analysis-service:8090` to query detailed similarity breakdowns.

### 2. `NotificationClient.java`
- Declarative Feign client targeting `notification-service:8084` to dispatch report ready alerts.
