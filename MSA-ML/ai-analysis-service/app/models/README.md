# AI Analysis Service — Database Models Layer

## 🎯 Purpose of this Package
Defines MongoDB document structures used for caching ML analysis results in MongoDB Atlas.

---

## 📄 Files in this Package

### `analysis_model.py`
- **Why it is used**: MongoDB schema representing the `analyses` collection.
- **Fields**:
  - `analysis_id`: Unique UUID for the analysis run.
  - `submission_id`: Correlated submission UUID.
  - `overall_ai_score`: Float (0.0 to 100.0).
  - `overall_similarity_score`: Float (0.0 to 100.0).
  - `sentences`: Array of sentence objects with per-sentence AI probability, similarity score, and reasoning.
  - `created_at`: Analysis timestamp.
