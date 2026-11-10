"""
SwasthyaCare — ML Sprint 1 Dataset Audit Script
Task IDs: ML1-03, ML1-04, ML1-05, ML1-07, ML1-08

This script conducts reproducible profiling of:
1. UCI Cleveland Heart Disease Dataset (id=45)
2. UCI CDC Diabetes Health Indicators Dataset (id=891)
"""

import pandas as pd
import numpy as np
import json
import os

def audit_heart_disease():
    print("=" * 60)
    print("AUDITING: UCI Cleveland Heart Disease Dataset")
    print("=" * 60)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    filepath = os.path.join(base_dir, "data", "cardiovascular", "processed.cleveland.data")
    columns = [
        "age", "sex", "cp", "trestbps", "chol", "fbs",
        "restecg", "thalach", "exang", "oldpeak", "slope",
        "ca", "thal", "target"
    ]
    df = pd.read_csv(filepath, names=columns, na_values="?")

    total_rows, total_cols = df.shape
    missing_counts = df.isnull().sum()
    duplicate_count = df.duplicated().sum()

    # Target analysis: 0 = absent, 1,2,3,4 = present
    raw_targets = df["target"].value_counts().sort_index().to_dict()
    binary_targets = (df["target"] > 0).astype(int).value_counts().to_dict()

    summary = {
        "dataset_name": "UCI Cleveland Heart Disease",
        "provenance": "Cleveland Clinic Foundation (Robert Detrano, M.D., Ph.D.)",
        "uci_id": 45,
        "license": "Creative Commons Attribution 4.0 International (CC BY 4.0)",
        "total_rows": total_rows,
        "total_columns": total_cols,
        "missing_values": {k: int(v) for k, v in missing_counts.items() if v > 0},
        "duplicate_rows": int(duplicate_count),
        "target_distribution_multiclass": raw_targets,
        "target_distribution_binary": {
            "negative_0_no_disease": binary_targets.get(0, 0),
            "positive_1_heart_disease": binary_targets.get(1, 0)
        },
        "features": list(df.columns[:-1]),
        "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()}
    }

    print(f"Total Rows: {total_rows}, Columns: {total_cols}")
    print(f"Missing Values: {summary['missing_values']}")
    print(f"Duplicates: {duplicate_count}")
    print(f"Target Binary: {summary['target_distribution_binary']}")

    # Check for potential target leakage or post-outcome features
    # Note: 'ca' (fluoroscopy) and 'thal' are diagnostic procedures performed in clinical workup.
    # 'oldpeak' and 'slope' are derived from exercise stress tests (ECG).
    print("Leakage audit: Features include diagnostic exercise ECG ('thalach', 'oldpeak', 'slope')")
    print("and angiographic/fluoroscopy counts ('ca'). None represent post-treatment outcomes.")

    return summary, df

def audit_diabetes():
    print("\n" + "=" * 60)
    print("AUDITING: UCI CDC Diabetes Health Indicators Dataset")
    print("=" * 60)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    filepath = os.path.join(base_dir, "data", "diabetes", "diabetes_health_indicators.csv")
    df = pd.read_csv(filepath)

    total_rows, total_cols = df.shape
    missing_counts = df.isnull().sum()
    duplicate_count = df.duplicated().sum()

    target_dist = df["Diabetes_binary"].value_counts().to_dict()

    summary = {
        "dataset_name": "CDC Diabetes Health Indicators (BRFSS 2015)",
        "provenance": "Centers for Disease Control and Prevention (CDC) - Behavioral Risk Factor Surveillance System",
        "uci_id": 891,
        "license": "Public Domain / CC0 (US Government Data)",
        "total_rows": total_rows,
        "total_columns": total_cols,
        "missing_values": {k: int(v) for k, v in missing_counts.items() if v > 0},
        "duplicate_rows": int(duplicate_count),
        "target_distribution": {
            "0_no_diabetes": target_dist.get(0.0, target_dist.get(0, 0)),
            "1_prediabetes_or_diabetes": target_dist.get(1.0, target_dist.get(1, 0))
        },
        "features": [c for c in df.columns if c != "Diabetes_binary"],
        "class_imbalance_ratio": f"{target_dist.get(0.0, 0) / max(1, target_dist.get(1.0, 1)):.2f}:1"
    }

    print(f"Total Rows: {total_rows}, Columns: {total_cols}")
    print(f"Missing Values: {len(summary['missing_values'])} columns with missing data")
    print(f"Duplicate Rows (Survey Artifacts): {duplicate_count} ({duplicate_count/total_rows*100:.2f}%)")
    print(f"Target Distribution: {summary['target_distribution']}")
    print(f"Class Imbalance Ratio: {summary['class_imbalance_ratio']}")

    # Leakage check:
    # Target represents self-reported diagnosed diabetes.
    # 'AnyHealthcare', 'NoDocbcCost' reflect access to care rather than biological physiology.
    print("Leakage audit: Target represents survey-reported diagnosis. Features like 'AnyHealthcare'")
    print("and 'NoDocbcCost' reflect socioeconomic access. Models must acknowledge this distinction.")

    return summary, df

if __name__ == "__main__":
    cardio_summary, _ = audit_heart_disease()
    diabetes_summary, _ = audit_diabetes()

    audit_results = {
        "audit_timestamp": pd.Timestamp.now().isoformat(),
        "cardiovascular": cardio_summary,
        "diabetes": diabetes_summary
    }

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.abspath(os.path.join(base_dir, "..", "Docs", "ml"))
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, "dataset_audit_metrics.json")
    with open(out_file, "w") as f:
        json.dump(audit_results, f, indent=2)
    print(f"\n Audit metrics saved to {out_file}")
