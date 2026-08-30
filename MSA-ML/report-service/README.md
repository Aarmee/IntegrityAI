# Report Service

## Purpose
Generates and manages academic integrity reports based on the analysis results produced by the AI Analysis Service.

## Main Responsibilities
- Receive analysis results
- Generate integrity reports
- Store report information
- Provide reports to faculty
- Allow faculty to retrieve reports for submissions

## Report Contents
- Submission details
- Text similarity score
- Semantic similarity score
- Code similarity score
- AI-content probability
- Overall risk score
- Risk level
- Analysis date and time

## Technology
- Spring Boot
- Spring Data JPA
- PostgreSQL
- OpenFeign
- Swagger/OpenAPI

## Main Entity

### Report
- report_id
- submission_id
- analysis_id
- report_url
- generated_at

## API Endpoints

### Reports
- POST `/api/reports`
- GET `/api/reports/{id}`
- GET `/api/reports/submission/{submissionId}`
- GET `/api/reports`
  
## Database
PostgreSQL

## Communication
The Report Service communicates with the AI Analysis Service to obtain analysis results and generates a consolidated integrity report.
