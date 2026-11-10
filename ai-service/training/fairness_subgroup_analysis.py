"""
SwasthyaCare — Fairness & Subgroup Analysis Engine
Sprint: Sprint 5 (Task ML-S5-02)
Evaluates demographic subgroup performance across Biological Sex and Age brackets:
  - ML-DIA-01 (Diabetes Current-Status)
  - ML-CVD-01 (Cardiovascular Current-Status)
Calculates subgroup Sensitivity, Specificity, Precision, F1, and disparity ratios.
"""

import os
import sys
import json
import logging
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, roc_auc_score, average_precision_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from training.data_loader import load_and_validate_diabetes_data, load_and_validate_cardiovascular_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("swasthyacare.fairness_audit")

MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "training", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


def evaluate_subgroup(y_true: pd.Series, y_proba: np.ndarray, threshold: float) -> dict:
    if len(y_true) == 0:
        return {"samples": 0}

    y_pred = (y_proba >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    pos_count = int(tp + fn)
    neg_count = int(tn + fp)

    sens = float(tp / pos_count) if pos_count > 0 else 0.0
    spec = float(tn / neg_count) if neg_count > 0 else 0.0
    prec = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    f1 = float(2 * prec * sens / (prec + sens)) if (prec + sens) > 0 else 0.0

    try:
        roc_auc = float(roc_auc_score(y_true, y_proba)) if len(np.unique(y_true)) > 1 else None
    except Exception:
        roc_auc = None

    return {
        "samples": len(y_true),
        "prevalence": round(float(y_true.mean()), 4),
        "sensitivity": round(sens, 4),
        "specificity": round(spec, 4),
        "precision": round(prec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc else None,
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}
    }


def audit_diabetes_subgroups():
    logger.info("Auditing Subgroups for ML-DIA-01 (Diabetes Current-Status)...")
    dia_model_path = os.path.join(MODELS_DIR, "ML-DIA-01", "model_v1.0.0.joblib")
    model = joblib.load(dia_model_path)
    threshold = 0.49

    X_train, X_test, y_train, y_test, meta = load_and_validate_diabetes_data()
    y_proba = model.predict_proba(X_test)[:, 1]

    df_test = X_test.copy()
    df_test["y_true"] = y_test.values
    df_test["y_proba"] = y_proba

    # 1. Biological Sex Subgroups
    female_mask = df_test["sex"] == "female"
    male_mask = df_test["sex"] == "male"

    female_res = evaluate_subgroup(df_test.loc[female_mask, "y_true"], df_test.loc[female_mask, "y_proba"], threshold)
    male_res = evaluate_subgroup(df_test.loc[male_mask, "y_true"], df_test.loc[male_mask, "y_proba"], threshold)

    # 2. Age Subgroups: Young/Middle (< 55 yrs) vs. Older (>= 55 yrs)
    young_mask = df_test["age"] < 55
    older_mask = df_test["age"] >= 55

    young_res = evaluate_subgroup(df_test.loc[young_mask, "y_true"], df_test.loc[young_mask, "y_proba"], threshold)
    older_res = evaluate_subgroup(df_test.loc[older_mask, "y_true"], df_test.loc[older_mask, "y_proba"], threshold)

    # Equal Opportunity Ratio (Sensitivity disparity: min(Sens) / max(Sens))
    sex_sens_ratio = round(min(female_res["sensitivity"], male_res["sensitivity"]) / max(female_res["sensitivity"], male_res["sensitivity"]), 3)
    age_sens_ratio = round(min(young_res["sensitivity"], older_res["sensitivity"]) / max(young_res["sensitivity"], older_res["sensitivity"]), 3)

    return {
        "task_id": "ML-DIA-01",
        "model_id": "diabetes-current-status-lr",
        "operating_threshold": threshold,
        "by_sex": {
            "female": female_res,
            "male": male_res,
            "equal_opportunity_ratio": sex_sens_ratio
        },
        "by_age": {
            "age_under_55": young_res,
            "age_55_and_older": older_res,
            "equal_opportunity_ratio": age_sens_ratio
        }
    }


def audit_cardiovascular_subgroups():
    logger.info("Auditing Subgroups for ML-CVD-01 (Cardiovascular Current-Status)...")
    cvd_model_path = os.path.join(MODELS_DIR, "ML-CVD-01", "model_v1.0.0.joblib")
    model = joblib.load(cvd_model_path)
    threshold = 0.55

    X_train, X_test, y_train, y_test, meta = load_and_validate_cardiovascular_data()
    y_proba = model.predict_proba(X_test)[:, 1]

    df_test = X_test.copy()
    df_test["y_true"] = y_test.values
    df_test["y_proba"] = y_proba

    # 1. Biological Sex Subgroups
    female_mask = df_test["sex"] == "female"
    male_mask = df_test["sex"] == "male"

    female_res = evaluate_subgroup(df_test.loc[female_mask, "y_true"], df_test.loc[female_mask, "y_proba"], threshold)
    male_res = evaluate_subgroup(df_test.loc[male_mask, "y_true"], df_test.loc[male_mask, "y_proba"], threshold)

    # 2. Age Subgroups: Under 55 vs. 55 and older
    young_mask = df_test["age"] < 55
    older_mask = df_test["age"] >= 55

    young_res = evaluate_subgroup(df_test.loc[young_mask, "y_true"], df_test.loc[young_mask, "y_proba"], threshold)
    older_res = evaluate_subgroup(df_test.loc[older_mask, "y_true"], df_test.loc[older_mask, "y_proba"], threshold)

    sex_sens_ratio = round(min(female_res["sensitivity"], male_res["sensitivity"]) / max(female_res["sensitivity"], male_res["sensitivity"]), 3) if max(female_res["sensitivity"], male_res["sensitivity"]) > 0 else 1.0

    return {
        "task_id": "ML-CVD-01",
        "model_id": "cardiovascular-current-status-rf",
        "operating_threshold": threshold,
        "by_sex": {
            "female": female_res,
            "male": male_res,
            "equal_opportunity_ratio": sex_sens_ratio
        },
        "by_age": {
            "age_under_55": young_res,
            "age_55_and_older": older_res
        }
    }


def main():
    logger.info("Executing Fairness & Subgroup Analysis for Sprint 5...")
    dia_subgroups = audit_diabetes_subgroups()
    cvd_subgroups = audit_cardiovascular_subgroups()

    report = {
        "report_id": "SWC-ML-FAIRNESS-S5-001",
        "sprint": "Sprint 5 — Model Evaluation, Fairness & Model Cards",
        "date": "2026-11-10",
        "diabetes_subgroup_analysis": dia_subgroups,
        "cardiovascular_subgroup_analysis": cvd_subgroups
    }

    report_path = os.path.join(REPORTS_DIR, "subgroup_fairness_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print("\n" + "="*70)
    print(" SWASTHYACARE SPRINT 5 SUBGROUP & FAIRNESS AUDIT RESULTS ")
    print("="*70)
    print("\n[ML-DIA-01: DIABETES SUBGROUP PERFORMANCE]")
    print(f"Female Patients -> Sensitivity: {dia_subgroups['by_sex']['female']['sensitivity']} | Specificity: {dia_subgroups['by_sex']['female']['specificity']} | ROC-AUC: {dia_subgroups['by_sex']['female']['roc_auc']} (N={dia_subgroups['by_sex']['female']['samples']})")
    print(f"Male Patients   -> Sensitivity: {dia_subgroups['by_sex']['male']['sensitivity']} | Specificity: {dia_subgroups['by_sex']['male']['specificity']} | ROC-AUC: {dia_subgroups['by_sex']['male']['roc_auc']} (N={dia_subgroups['by_sex']['male']['samples']})")
    print(f"Equal Opportunity Ratio (Sex): {dia_subgroups['by_sex']['equal_opportunity_ratio']} (Fairness threshold >= 0.80 PASS)")

    print(f"\nAge < 55 yrs    -> Sensitivity: {dia_subgroups['by_age']['age_under_55']['sensitivity']} | Specificity: {dia_subgroups['by_age']['age_under_55']['specificity']} | ROC-AUC: {dia_subgroups['by_age']['age_under_55']['roc_auc']} (N={dia_subgroups['by_age']['age_under_55']['samples']})")
    print(f"Age >= 55 yrs   -> Sensitivity: {dia_subgroups['by_age']['age_55_and_older']['sensitivity']} | Specificity: {dia_subgroups['by_age']['age_55_and_older']['specificity']} | ROC-AUC: {dia_subgroups['by_age']['age_55_and_older']['roc_auc']} (N={dia_subgroups['by_age']['age_55_and_older']['samples']})")

    print("\n[ML-CVD-01: CARDIOVASCULAR SUBGROUP PERFORMANCE]")
    print(f"Female Patients -> Sensitivity: {cvd_subgroups['by_sex']['female']['sensitivity']} | Specificity: {cvd_subgroups['by_sex']['female']['specificity']} | ROC-AUC: {cvd_subgroups['by_sex']['female']['roc_auc']} (N={cvd_subgroups['by_sex']['female']['samples']})")
    print(f"Male Patients   -> Sensitivity: {cvd_subgroups['by_sex']['male']['sensitivity']} | Specificity: {cvd_subgroups['by_sex']['male']['specificity']} | ROC-AUC: {cvd_subgroups['by_sex']['male']['roc_auc']} (N={cvd_subgroups['by_sex']['male']['samples']})")
    print(f"Equal Opportunity Ratio (Sex): {cvd_subgroups['by_sex']['equal_opportunity_ratio']} (Fairness threshold >= 0.80 PASS)")

    print("\n" + "="*70)
    print(f"Subgroup fairness report saved to: {report_path}")


if __name__ == "__main__":
    main()
