"""
Model Trainer and Benchmarking Engine for AI vs. Human Text Classifier.
Performs 5-Fold Stratified Cross Validation, benchmarks 4 candidate ML algorithms,
generates evaluation visualizations, and serializes the champion pipeline with joblib.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any

import joblib
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive headless backend for server environments
import matplotlib.pyplot as plt

from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve,
    classification_report
)

from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV

from app.ml.features import create_feature_pipeline
from app.ml.dataset import load_dataset

logger = logging.getLogger(__name__)


def get_candidate_models() -> Dict[str, Any]:
    """Define candidate ML classifiers for benchmarking."""
    return {
        "Logistic Regression": LogisticRegression(
            penalty="l2",
            C=1.0,
            solver="lbfgs",
            max_iter=1000,
            random_state=42
        ),
        "Multinomial Naive Bayes": MultinomialNB(
            alpha=0.5
        ),
        "Random Forest Classifier": RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=3,
            random_state=42
        ),
        "Calibrated Linear SVM": CalibratedClassifierCV(
            estimator=LinearSVC(C=1.0, dual=False, max_iter=5000, random_state=42),
            method="sigmoid",
            cv=3
        )
    }


def train_and_benchmark(output_dir: str | Path | None = None) -> Dict[str, Any]:
    """
    Executes full ML training pipeline:
      1. Loads academic text dataset
      2. Benchmarks 4 candidate classifiers with Stratified 5-Fold CV
      3. Performs hold-out test evaluation with Confusion Matrix & ROC curves
      4. Serializes the champion model to .joblib
      5. Saves evaluation metrics JSON & diagnostic plots
    """
    if output_dir is None:
        # Default to MSA-ML/ai-analysis-service/models
        base_dir = Path(__file__).resolve().parent.parent.parent
        output_dir = base_dir / "models"
    else:
        output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)
    logger.info("Starting ML Training Pipeline. Output dir: %s", output_dir)

    # 1. Load Dataset
    texts, labels = load_dataset()
    y = np.array(labels, dtype=int)
    logger.info("Loaded %d balanced text samples (Human: %d, AI: %d)", len(texts), sum(y == 0), sum(y == 1))

    # 2. Benchmarking across Candidate Classifiers
    candidates = get_candidate_models()
    benchmark_results = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    scoring = {
        "accuracy": "accuracy",
        "precision": "precision",
        "recall": "recall",
        "f1": "f1",
        "roc_auc": "roc_auc"
    }

    print("\n" + "=" * 75)
    print("  INTEGRITY-AI MACHINE LEARNING BENCHMARK (5-FOLD CROSS VALIDATION)")
    print("=" * 75)
    print(f"{'Classifier':<28} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'ROC-AUC':<10}")
    print("-" * 75)

    champion_name = None
    champion_f1 = -1.0
    champion_pipeline = None

    for name, clf in candidates.items():
        pipe = Pipeline([
            ("features", create_feature_pipeline()),
            ("classifier", clf)
        ])

        scores = cross_validate(pipe, texts, y, cv=cv, scoring=scoring, n_jobs=1)

        acc_mean = float(np.mean(scores["test_accuracy"]))
        prec_mean = float(np.mean(scores["test_precision"]))
        rec_mean = float(np.mean(scores["test_recall"]))
        f1_mean = float(np.mean(scores["test_f1"]))
        auc_mean = float(np.mean(scores["test_roc_auc"]))

        benchmark_results[name] = {
            "accuracy": round(acc_mean, 4),
            "precision": round(prec_mean, 4),
            "recall": round(rec_mean, 4),
            "f1_score": round(f1_mean, 4),
            "roc_auc": round(auc_mean, 4),
        }

        print(f"{name:<28} | {acc_mean*100:>7.2f}%   | {prec_mean*100:>7.2f}%   | {rec_mean*100:>7.2f}%   | {f1_mean*100:>7.2f}%   | {auc_mean:>7.4f}")

        if f1_mean > champion_f1:
            champion_f1 = f1_mean
            champion_name = name
            champion_pipeline = pipe

    print("=" * 75)
    print(f" Champion Selected: {champion_name} (F1-Score: {champion_f1*100:.2f}%)\n")

    # 3. Train / Test Holdout Validation for Detailed Reporting
    X_train, X_test, y_train, y_test = train_test_split(
        texts, y, test_size=0.20, random_state=42, stratify=y
    )

    # Re-instantiate a clean champion pipeline for holdout evaluation
    champion_clf = get_candidate_models()[champion_name]
    final_pipeline = Pipeline([
        ("features", create_feature_pipeline()),
        ("classifier", champion_clf)
    ])

    final_pipeline.fit(X_train, y_train)
    y_pred = final_pipeline.predict(X_test)
    y_proba = final_pipeline.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    clf_report = classification_report(y_test, y_pred, target_names=["Human (0)", "AI (1)"], output_dict=True)

    fpr, tpr, _ = roc_curve(y_test, y_proba)
    holdout_auc = float(roc_auc_score(y_test, y_proba))

    # 4. Train Champion on 100% of Dataset for Final Production Artifact
    production_pipeline = Pipeline([
        ("features", create_feature_pipeline()),
        ("classifier", get_candidate_models()[champion_name])
    ])
    production_pipeline.fit(texts, y)

    # 5. Serialize Model
    model_path = output_dir / "ai_detector_model.joblib"
    joblib.dump(production_pipeline, model_path)
    logger.info("Serialized champion model to: %s", model_path)

    # 6. Generate Academic Visualizations
    _generate_plots(
        output_dir=output_dir,
        benchmark_results=benchmark_results,
        cm=cm,
        fpr=fpr,
        tpr=tpr,
        roc_auc=holdout_auc,
        champion_name=champion_name
    )

    # 7. Save Comprehensive Metrics JSON
    metrics_data = {
        "champion_model": champion_name,
        "dataset_size": len(texts),
        "human_samples": int(sum(y == 0)),
        "ai_samples": int(sum(y == 1)),
        "cross_validation": {
            "strategy": "5-Fold Stratified Cross-Validation",
            "benchmarks": benchmark_results
        },
        "holdout_evaluation": {
            "test_size": len(y_test),
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            },
            "classification_report": clf_report,
            "roc_auc": round(holdout_auc, 4)
        },
        "model_file": str(model_path.name)
    }

    metrics_path = output_dir / "model_metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    logger.info("Saved model evaluation metrics to: %s", metrics_path)
    return metrics_data


def _generate_plots(
    output_dir: Path,
    benchmark_results: Dict[str, Dict[str, float]],
    cm: np.ndarray,
    fpr: np.ndarray,
    tpr: np.ndarray,
    roc_auc: float,
    champion_name: str
):
    """Generate high-resolution PNG charts for the academic project report."""
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")

    # Plot 1: Confusion Matrix
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)
    ax.set(
        xticks=np.arange(2),
        yticks=np.arange(2),
        xticklabels=["Human", "AI"],
        yticklabels=["Human", "AI"],
        title=f"Confusion Matrix ({champion_name})",
        ylabel="Ground Truth Label",
        xlabel="Predicted Label"
    )

    # Text annotations inside confusion matrix
    thresh = cm.max() / 2.0
    for i in range(2):
        for j in range(2):
            ax.text(
                j, i, format(cm[i, j], "d"),
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black",
                fontsize=14, fontweight="bold"
            )
    plt.tight_layout()
    cm_path = output_dir / "confusion_matrix.png"
    plt.savefig(cm_path, dpi=200)
    plt.close()

    # Plot 2: ROC-AUC Curve
    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(fpr, tpr, color="#2563EB", lw=2.5, label=f"ROC curve (AUC = {roc_auc:.3f})")
    ax.plot([0, 1], [0, 1], color="#94A3B8", lw=1.5, linestyle="--", label="Random Chance (AUC = 0.50)")
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    ax.set_ylabel("True Positive Rate (Sensitivity / Recall)", fontsize=11)
    ax.set_title(f"ROC-AUC Curve ({champion_name})", fontsize=12, fontweight="bold")
    ax.legend(loc="lower right", frameon=True)
    plt.tight_layout()
    roc_path = output_dir / "roc_curve.png"
    plt.savefig(roc_path, dpi=200)
    plt.close()

    # Plot 3: Model Comparison Bar Chart
    models = list(benchmark_results.keys())
    f1_scores = [benchmark_results[m]["f1_score"] * 100 for m in models]
    accuracies = [benchmark_results[m]["accuracy"] * 100 for m in models]

    x = np.arange(len(models))
    width = 0.35

    fig, ax = plt.subplots(figsize=(8, 5))
    rects1 = ax.bar(x - width/2, accuracies, width, label="Accuracy (%)", color="#3B82F6")
    rects2 = ax.bar(x + width/2, f1_scores, width, label="F1-Score (%)", color="#10B981")

    ax.set_ylabel("Score (%)", fontsize=11)
    ax.set_title("5-Fold Cross Validation Benchmark Across Algorithms", fontsize=12, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(models, rotation=15, ha="right", fontsize=9)
    ax.set_ylim([70, 105])
    ax.legend(loc="lower right")

    # Add values on top of bars
    for rect in rects1:
        h = rect.get_height()
        ax.annotate(f"{h:.1f}%", xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8)
    for rect in rects2:
        h = rect.get_height()
        ax.annotate(f"{h:.1f}%", xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8)

    plt.tight_layout()
    comparison_path = output_dir / "model_comparison.png"
    plt.savefig(comparison_path, dpi=200)
    plt.close()
