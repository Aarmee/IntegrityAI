#!/usr/bin/env python
"""
Command-line runner to train and benchmark the AI Detection ML models.
Can be executed directly from terminal:
    python train_model.py

Outputs:
    - models/ai_detector_model.joblib
    - models/model_metrics.json
    - models/confusion_matrix.png
    - models/roc_curve.png
    - models/model_comparison.png
"""

import sys
import logging
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.ml.trainer import train_and_benchmark

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    metrics = train_and_benchmark()
    print("\nTraining complete! Artifacts saved in 'models/' directory.")
