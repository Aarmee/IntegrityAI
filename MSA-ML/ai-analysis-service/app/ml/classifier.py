"""
Runtime Inference Wrapper for the Trained AI vs. Human Text Classification Pipeline.
Provides lazy-loading, caching, thread-safety, and feature extraction.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import joblib

from app.ml.features import StylometricFeatureExtractor, tokenize_words, split_sentences

logger = logging.getLogger(__name__)

_CLASSIFIER_INSTANCE: Optional["AITextClassifier"] = None


class AITextClassifier:
    """Production inference wrapper around the serialized Scikit-Learn pipeline."""

    def __init__(self, model_path: Optional[str | Path] = None):
        if model_path is None:
            base_dir = Path(__file__).resolve().parent.parent.parent
            model_path = base_dir / "models" / "ai_detector_model.joblib"
        else:
            model_path = Path(model_path)

        self.model_path = model_path
        self.extractor = StylometricFeatureExtractor()
        self.pipeline = None
        self.model_name = "Ensemble ML Pipeline (Stylometric TF-IDF)"
        self._load_or_train()

    def _load_or_train(self):
        """Loads serialized model artifact from disk, or triggers training if absent."""
        if not self.model_path.exists():
            logger.warning("Trained model not found at %s. Triggering automatic initial training...", self.model_path)
            from app.ml.trainer import train_and_benchmark
            train_and_benchmark(output_dir=self.model_path.parent)

        try:
            self.pipeline = joblib.load(self.model_path)
            logger.info("Successfully loaded AI detector pipeline from %s", self.model_path)
        except Exception as e:
            logger.error("Failed to load model from %s: %s", self.model_path, e)
            self.pipeline = None

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Classifies input text and returns probabilistic scores and stylometric breakdown.

        Returns:
            {
                "ai_probability": float (0.0 to 100.0),
                "human_probability": float (0.0 to 100.0),
                "predicted_class": int (0 or 1),
                "class_label": str ("AI-Generated" | "Human-Authored"),
                "stylometric_features": dict,
                "model_name": str,
                "status": "success" | "fallback"
            }
        """
        features_dict = self.extractor.extract_feature_dict(text)

        # Basic defaults
        burstiness = features_dict.get("burstiness_cv", 0.0)
        lexical_diversity = features_dict.get("lexical_diversity_ttr", 0.0)

        if not text or len(text.strip()) < 30:
            return {
                "ai_probability": 0.0,
                "human_probability": 100.0,
                "predicted_class": 0,
                "class_label": "Human-Authored",
                "stylometric_features": features_dict,
                "burstiness": burstiness,
                "lexical_diversity": lexical_diversity,
                "model_name": self.model_name,
                "status": "short_text"
            }

        if self.pipeline is None:
            self._load_or_train()

        if self.pipeline is not None:
            try:
                # Predict probability distribution [P(human), P(ai)]
                probas = self.pipeline.predict_proba([text])[0]
                p_human = float(probas[0]) * 100.0
                p_ai = float(probas[1]) * 100.0
                pred_class = int(self.pipeline.predict([text])[0])
                class_label = "AI-Generated" if pred_class == 1 else "Human-Authored"

                return {
                    "ai_probability": round(p_ai, 2),
                    "human_probability": round(p_human, 2),
                    "predicted_class": pred_class,
                    "class_label": class_label,
                    "stylometric_features": features_dict,
                    "burstiness": burstiness,
                    "lexical_diversity": lexical_diversity,
                    "model_name": self.model_name,
                    "status": "success"
                }
            except Exception as e:
                logger.error("Error during ML pipeline inference: %s", e)

        # Fallback if model could not execute
        return {
            "ai_probability": 0.0,
            "human_probability": 100.0,
            "predicted_class": 0,
            "class_label": "Human-Authored",
            "stylometric_features": features_dict,
            "burstiness": burstiness,
            "lexical_diversity": lexical_diversity,
            "model_name": "Fallback Heuristic",
            "status": "fallback"
        }


def get_classifier() -> AITextClassifier:
    """Returns singleton instance of AITextClassifier."""
    global _CLASSIFIER_INSTANCE
    if _CLASSIFIER_INSTANCE is None:
        _CLASSIFIER_INSTANCE = AITextClassifier()
    return _CLASSIFIER_INSTANCE
