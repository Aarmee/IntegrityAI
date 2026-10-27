# AI Analysis Service — Machine Learning Layer

## 🎯 Purpose of this Package
Contains the **Machine Learning & NLP Engine** used by IntegrityAI. This layer implements feature extraction, stylometric analysis, text vectorization, and statistical heuristics to detect both AI-generated content (e.g. ChatGPT) and lexical text plagiarism.

---

## 📄 Files in this Package

### 1. `features.py`
- **Why it is used**: Extracts stylometric and statistical NLP features from student text submissions.
- **Key Algorithms**:
  - **Perplexity & Burstiness**: Measures sentence length variance and token unpredictability. AI models produce uniform, predictable sentence structures (low burstiness), whereas human writers have varied sentence rhythms (high burstiness).
  - **Lexical Diversity (Type-Token Ratio - TTR)**: Calculates vocabulary richness.
  - **Readability Indices**: Flesch-Kincaid and Gunning-Fog readability scores.
  - **Punctuation & Stopword Frequencies**: Quantifies stylistic writing signatures.

### 2. `classifier.py`
- **Why it is used**: Combines lexical feature vectors with trained classification models to produce probability scores (0% to 100%) indicating the likelihood of AI generation.
- **Why scikit-learn**: We utilize `scikit-learn` algorithms (Random Forest / Logistic Regression) because they execute in **sub-100ms** on commodity CPU hardware without requiring heavy multi-gigabyte GPU dependencies.

### 3. `trainer.py` & `dataset.py`
- **Why it is used**: Training pipeline and synthetic dataset generator for human vs. AI academic writing. Allows fine-tuning the model weights on academic corpus data.
