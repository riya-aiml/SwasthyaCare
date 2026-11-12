"""
SwasthyaCare AI Service — Medical Department Specialty Classifier Training Pipeline
Task: ML-DEP-01
Trains and benchmarks classical machine learning models (TF-IDF + Naive Bayes / Logistic Regression / LinearSVC)
to categorize patient symptom descriptions into 8 hospital clinical outpatient departments.

Evaluates stratified 5-fold cross-validation, generates classification reports,
extracts top clinical n-gram features per department, and serializes production .joblib artifacts.
"""

import os
import sys
import json
import logging
import time
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score,
    accuracy_score,
    precision_score,
    recall_score
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("swasthyacare.train_specialty_classifier")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "processed", "real_clinical_specialties_dataset.json")
MODELS_DIR = os.path.join(BASE_DIR, "models", "ML-DEP-01")
REPORTS_DIR = os.path.join(BASE_DIR, "training", "reports")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


def load_dataset() -> Tuple[List[str], List[str]]:
    """Loads and validates the authentic clinical dataset from Kaggle / Gretel.ai."""
    if not os.path.isfile(DATA_FILE):
        raise FileNotFoundError(f"Training dataset not found at: {DATA_FILE}")

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        records = json.load(f)

    texts = [r["symptom_text"] for r in records]
    labels = [r["department"] for r in records]
    logger.info("Loaded %d authentic clinical symptom records across %d hospital departments.", len(texts), len(set(labels)))
    return texts, labels


def benchmark_candidate_models(X_train: List[str], y_train: List[str]) -> Tuple[str, Pipeline, Dict[str, Any]]:
    """
    Benchmarks 3 classical ML classifiers using Stratified 5-Fold Cross-Validation.
    Selects the champion architecture based on mean macro-F1 score.
    """
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    candidates = {
        "Multinomial_Naive_Bayes": Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words="english", min_df=2)),
            ("clf", MultinomialNB(alpha=0.05))
        ]),
        "Calibrated_Logistic_Regression": Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words="english", min_df=2)),
            ("clf", LogisticRegression(C=5.0, class_weight="balanced", max_iter=1000, random_state=42))
        ]),
        "Calibrated_Linear_SVC": Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words="english", min_df=2)),
            ("clf", CalibratedClassifierCV(LinearSVC(C=1.5, random_state=42), method="sigmoid", cv=3))
        ])
    }

    results = {}
    best_name = None
    best_score = -1.0
    best_pipeline = None

    logger.info("Executing Stratified 5-Fold Cross Validation across candidate models...")
    for name, pipeline in candidates.items():
        scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="f1_macro")
        mean_score = float(np.mean(scores))
        std_score = float(np.std(scores))
        results[name] = {
            "mean_cv_f1_macro": round(mean_score, 4),
            "std_cv_f1_macro": round(std_score, 4),
            "cv_scores": [round(float(s), 4) for s in scores]
        }
        logger.info("-> %s: Mean Macro-F1 = %.4f (+/- %.4f)", name, mean_score, std_score)

        if mean_score > best_score:
            best_score = mean_score
            best_name = name
            best_pipeline = pipeline

    logger.info("🏆 Selected Champion Model: %s (Macro-F1: %.4f)", best_name, best_score)
    return best_name, best_pipeline, results


def extract_top_features_per_department(pipeline: Pipeline, classes: List[str], top_n: int = 5) -> Dict[str, List[str]]:
    """
    Extracts the most clinically informative n-gram terms per specialty department.
    Enables medical interpretability & explainability.
    """
    tfidf: TfidfVectorizer = pipeline.named_steps["tfidf"]
    classifier = pipeline.named_steps["clf"]
    feature_names = np.array(tfidf.get_feature_names_out())

    top_features = {}

    # Logistic Regression coefficients
    if hasattr(classifier, "coef_"):
        for i, class_label in enumerate(classes):
            top_indices = np.argsort(classifier.coef_[i])[-top_n:][::-1]
            top_features[class_label] = feature_names[top_indices].tolist()
    # CalibratedClassifierCV wrapping LinearSVC
    elif hasattr(classifier, "calibrated_classifiers_"):
        # Average weights across base estimators
        base_coefs = np.mean([clf.estimator.coef_ for clf in classifier.calibrated_classifiers_], axis=0)
        for i, class_label in enumerate(classes):
            top_indices = np.argsort(base_coefs[i])[-top_n:][::-1]
            top_features[class_label] = feature_names[top_indices].tolist()
    else:
        # MultinomialNB feature log prob
        for i, class_label in enumerate(classes):
            top_indices = np.argsort(classifier.feature_log_prob_[i])[-top_n:][::-1]
            top_features[class_label] = feature_names[top_indices].tolist()

    return top_features


def train_and_evaluate():
    """Main execution flow for training, evaluating, and serializing the model."""
    logger.info("================================================================")
    logger.info("🏥 STARTING SWASTHYACARE MEDICAL SPECIALTY CLASSIFIER TRAINING")
    logger.info("================================================================")

    texts, labels = load_dataset()

    # 80/20 Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.20, stratify=labels, random_state=42
    )
    logger.info("Dataset split: %d training samples, %d test samples.", len(X_train), len(X_test))

    # Benchmark candidate algorithms
    champion_name, champion_pipeline, cv_benchmark = benchmark_candidate_models(X_train, y_train)

    # Fit champion model on full training set
    start_train = time.time()
    champion_pipeline.fit(X_train, y_train)
    train_duration_ms = int((time.time() - start_train) * 1000)
    logger.info("Champion model training completed in %d ms.", train_duration_ms)

    # Evaluate on held-out test split
    y_pred = champion_pipeline.predict(X_test)
    y_proba = champion_pipeline.predict_proba(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    macro_f1 = float(f1_score(y_test, y_pred, average="macro"))
    weighted_f1 = float(f1_score(y_test, y_pred, average="weighted"))
    precision = float(precision_score(y_test, y_pred, average="macro"))
    recall = float(recall_score(y_test, y_pred, average="macro"))

    classes = champion_pipeline.classes_.tolist()
    cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()
    report_dict = classification_report(y_test, y_pred, labels=classes, output_dict=True)

    # Extract top informative features
    top_features = extract_top_features_per_department(champion_pipeline, classes, top_n=6)

    logger.info("--- HELD-OUT TEST PERFORMANCE ---")
    logger.info("Accuracy:    %.4f (%.1f%%)", acc, acc * 100)
    logger.info("Macro F1:    %.4f", macro_f1)
    logger.info("Weighted F1: %.4f", weighted_f1)
    logger.info("Precision:   %.4f", precision)
    logger.info("Recall:      %.4f", recall)

    # 1. Serialize .joblib model artifact
    model_artifact_path = os.path.join(MODELS_DIR, "specialty_classifier_v1.0.0.joblib")
    joblib.dump(champion_pipeline, model_artifact_path)
    logger.info("Saved serialized model artifact to: %s", model_artifact_path)

    # 2. Build model metadata
    model_metadata = {
        "task_id": "ML-DEP-01",
        "model_id": "clinical-department-specialty-classifier",
        "model_version": "1.0.0",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "champion_algorithm": champion_name,
        "feature_extractor": "TfidfVectorizer(ngram_range=(1,2), sublinear_tf=True)",
        "num_classes": len(classes),
        "target_departments": classes,
        "metrics_on_test": {
            "accuracy": round(acc, 4),
            "macro_f1": round(macro_f1, 4),
            "weighted_f1": round(weighted_f1, 4),
            "macro_precision": round(precision, 4),
            "macro_recall": round(recall, 4),
            "confusion_matrix": cm,
            "per_class_report": {k: v for k, v in report_dict.items() if k in classes}
        },
        "top_informative_features": top_features,
        "benchmark_comparison": cv_benchmark
    }

    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(model_metadata, f, indent=2)
    logger.info("Saved model metadata to: %s", metadata_path)

    # 3. Build comprehensive evaluation report
    eval_report = {
        "report_id": "ML-DEP-01-EVAL-REPORT",
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "champion_algorithm": champion_name,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "overall_performance": {
            "accuracy": round(acc, 4),
            "macro_f1": round(macro_f1, 4),
            "weighted_f1": round(weighted_f1, 4)
        },
        "confusion_matrix_labels": classes,
        "confusion_matrix": cm,
        "per_specialty_features": top_features,
        "cv_benchmark_summary": cv_benchmark
    }

    eval_report_path = os.path.join(REPORTS_DIR, "specialty_classifier_evaluation_report.json")
    with open(eval_report_path, "w", encoding="utf-8") as f:
        json.dump(eval_report, f, indent=2)
    logger.info("Saved evaluation report to: %s", eval_report_path)

    logger.info("================================================================")
    logger.info("✅ MODEL TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    logger.info("================================================================")


if __name__ == "__main__":
    train_and_evaluate()
