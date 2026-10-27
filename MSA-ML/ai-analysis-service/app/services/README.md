# AI Analysis Service — Services Layer

## 🎯 Purpose of this Package
Coordinates text processing pipelines, ML inference, and similarity comparisons across submissions.

---

## 📄 Files in this Package

### 1. `analysis_service.py`
- **Why it is used**: Orchestrator service. Coordinates text extraction, sentence tokenization, AI detection, and similarity calculations.
- **Workflow**:
  1. Splits input text into clean sentences.
  2. Runs `AiDetectionService` on each sentence.
  3. Runs `PlagiarismService` against the submission database.
  4. Aggregates sentence scores into a weighted overall percentage score.
  5. Caches the result in MongoDB Atlas.

### 2. `ai_detection_service.py`
- **Why it is used**: Evaluates text for AI-generated patterns.
- **Techniques**:
  - Uses `features.py` to calculate sentence perplexity, entropy, burstiness, and repetitive phrase frequency.
  - Flags high-confidence AI text with explanation tags (e.g., *"Uniform sentence structure with characteristic LLM transition phrases"*).

### 3. `plagiarism_service.py`
- **Why it is used**: Computes **TF-IDF + Cosine Similarity** against historical submissions in the MongoDB repository.
- **Algorithms**:
  - `TfidfVectorizer(ngram_range=(1, 3))`: Generates unigram, bigram, and trigram term frequency-inverse document frequency vectors.
  - `cosine_similarity()`: Computes angular distance between submitted vector and existing assignment submissions.
