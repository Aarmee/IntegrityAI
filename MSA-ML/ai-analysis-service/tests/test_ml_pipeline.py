"""
Comprehensive Unit & Integration Tests for the Machine Learning Pipeline.
Tests Stylometric Feature Extraction, Pipeline Transformations, Inference, and Artifact Integrity.
"""

from pathlib import Path
import numpy as np
import pytest

from app.ml.features import StylometricFeatureExtractor, create_feature_pipeline
from app.ml.classifier import get_classifier


def test_stylometric_feature_extractor_valid_text():
    extractor = StylometricFeatureExtractor()
    sample = (
        "In today's fast-paced digital era, cloud computing plays a pivotal role. "
        "Furthermore, microservices provide a multifaceted approach to scalability. "
        "In conclusion, adopting modern DevOps practices is essential for enterprises."
    )
    features = extractor.extract_feature_dict(sample)

    assert "burstiness_cv" in features
    assert "lexical_diversity_ttr" in features
    assert "mean_sentence_length" in features
    assert "function_word_ratio" in features
    assert "prescriptive_word_ratio" in features

    for k, v in features.items():
        assert isinstance(v, float)
        assert not np.isnan(v)
        assert not np.isinf(v)


def test_stylometric_extractor_empty_and_short():
    extractor = StylometricFeatureExtractor()
    empty_features = extractor.extract_feature_dict("")
    for v in empty_features.values():
        assert v == 0.0

    short_features = extractor.extract_feature_dict("Hi.")
    assert isinstance(short_features["lexical_diversity_ttr"], float)


def test_feature_pipeline_transform():
    pipe = create_feature_pipeline()
    corpus = [
        "In conclusion, modern cloud infrastructure plays a crucial role in scalability.",
        "We measured the tensile yield strength of mild steel specimens at 318 MPa."
    ]
    matrix = pipe.fit_transform(corpus)
    assert matrix.shape[0] == 2
    assert matrix.shape[1] > 14  # Stylometric (14) + TF-IDF ngrams


def test_classifier_predictions():
    classifier = get_classifier()

    # 1. Blank / Short input
    res_empty = classifier.predict("")
    assert res_empty["ai_probability"] == 0.0
    assert res_empty["class_label"] == "Human-Authored"

    # 2. Authentic Student Empirical Text
    human_text = (
        "We conducted the tensile test on three cylindrical mild steel specimens using an "
        "electromechanical Instron 5982 frame. Each specimen had an initial gauge length of "
        "50.0 mm and a nominal diameter of 12.5 mm according to ASTM E8 guidelines. The upper "
        "yield strength was observed at 318.4 MPa, after which plastic deformation set in. "
        "Necking started slightly past the ultimate tensile strength of 462.1 MPa."
    )
    res_human = classifier.predict(human_text)
    assert res_human["ai_probability"] < 40.0
    assert res_human["predicted_class"] == 0
    assert "burstiness" in res_human
    assert "lexical_diversity" in res_human

    # 3. AI Generated Essay
    ai_text = (
        "In today's rapidly evolving digital landscape, cloud computing plays a pivotal role in "
        "modern enterprise architecture. It is important to note that organizations are transitioning "
        "from traditional on-premises infrastructure toward scalable microservices solutions. Cloud platforms "
        "provide a multifaceted approach to resource allocation, enabling businesses to achieve seamless "
        "scalability. Furthermore, containerization technologies serve as a testament to transformative software engineering. "
        "In conclusion, embracing cloud-native principles is essential for organizations."
    )
    res_ai = classifier.predict(ai_text)
    assert res_ai["ai_probability"] > 60.0
    assert res_ai["predicted_class"] == 1


def test_model_artifacts_exist():
    base_dir = Path(__file__).resolve().parent.parent
    models_dir = base_dir / "models"

    assert (models_dir / "ai_detector_model.joblib").exists()
    assert (models_dir / "ai_detector_model.joblib").stat().st_size > 10_000

    assert (models_dir / "model_metrics.json").exists()
    assert (models_dir / "confusion_matrix.png").exists()
    assert (models_dir / "roc_curve.png").exists()
    assert (models_dir / "model_comparison.png").exists()
