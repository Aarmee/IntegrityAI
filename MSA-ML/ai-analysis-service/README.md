# AI Analysis Service

## Purpose
Performs AI and machine learning based analysis of student submissions to identify potential academic integrity issues.

## Main Responsibilities
- Analyze submitted assignment content
- Perform text similarity analysis
- Perform semantic similarity analysis
- Analyze source code similarity
- Estimate the probability of AI-generated content
- Generate an overall integrity risk score
- Store analysis results

## Analysis Components

### 1. Text Similarity
Compares submitted text with available reference or previously submitted content.

### 2. Semantic Similarity
Uses semantic embeddings to identify similarities even when the wording is different.

### 3. Code Similarity
Analyzes programming submissions to identify similarities in code structure and logic.

### 4. AI Content Analysis
Estimates whether submitted content may have been generated or assisted by AI.

### 5. Risk Scoring
Combines analysis results to classify the submission as:

- Low Risk
- Medium Risk
- High Risk

## Technology
- Python
- FastAPI
- Machine Learning
- Sentence Transformers
- CodeBERT
- Tree-sitter / AST Analysis
- MongoDB
- Swagger/OpenAPI

## Main Entity

### Analysis Result
- analysis_id
- submission_id
- text_similarity
- semantic_similarity
- code_similarity
- ai_probability
- risk_score
- risk_level
- analyzed_at

## API Endpoints

- POST `/api/analysis/analyze/{submissionId}`
- GET `/api/analysis/{id}`
- GET `/api/analysis/submission/{submissionId}`

## Database
MongoDB

## Communication
The AI Analysis Service receives submission information from the Submission Service and returns/stores the analysis result.

## Important Note
The AI-content analysis provides a probability or risk indication and should not be treated as a definitive proof of AI usage.
