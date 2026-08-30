# Submission Service

## Purpose
Manages student assignment submissions in the IntegrityAI platform.

## Main Responsibilities
- Upload student assignments
- Store submission metadata
- Associate submissions with students and assignments
- Track submission status
- Trigger the AI analysis process
- Provide submission details

## Supported Files
- PDF
- DOCX
- ZIP
- Source code files

## Technology
- Spring Boot
- Spring Data MongoDB
- MongoDB
- OpenFeign
- Swagger/OpenAPI

## Main Entity

### Submission
- submission_id
- student_id
- assignment_id
- file_name
- file_type
- file_url
- submitted_at
- status

## Submission Status
- Uploaded
- Processing
- Completed
- Failed

## API Endpoints

### Submission
- POST `/api/submissions`
- GET `/api/submissions`
- GET `/api/submissions/{id}`
- GET `/api/submissions/student/{studentId}`
- GET `/api/submissions/assignment/{assignmentId}`

## Database
MongoDB

## Communication
The Submission Service communicates with other services when required and can trigger the AI Analysis Service after a submission is successfully uploaded.
