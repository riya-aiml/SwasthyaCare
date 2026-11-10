"""
SwasthyaCare — Synthetic Clinical Data Generator
Task: ML-S2-04
Generates privacy-preserving, clinically plausible synthetic datasets for development,
unit testing, edge-case testing, and pipeline benchmarking.
"""

import os
import json
import random
import numpy as np
import pandas as pd
from typing import List, Dict, Any

# Fixed seed for deterministic reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)


def generate_synthetic_diabetes_records(n_records: int = 200) -> List[Dict[str, Any]]:
    """
    Generate synthetic records matching the CDC BRFSS feature distributions.
    Includes positive, negative, and edge cases (boundary BMI, boundary age).
    """
    records = []
    for i in range(n_records):
        # 30% synthetic positive probability
        is_diabetic_profile = random.random() < 0.35

        if is_diabetic_profile:
            age = random.randint(45, 80)
            bmi = round(float(np.random.normal(32.5, 5.0)), 2)
            high_bp = random.random() < 0.75
            high_chol = random.random() < 0.70
            gen_hlth = random.choice([3, 4, 5])
            diff_walk = random.random() < 0.40
            phys_activity = random.random() < 0.50
            target = 1
        else:
            age = random.randint(20, 65)
            bmi = round(float(np.random.normal(24.5, 3.5)), 2)
            high_bp = random.random() < 0.20
            high_chol = random.random() < 0.25
            gen_hlth = random.choice([1, 2, 3])
            diff_walk = random.random() < 0.08
            phys_activity = random.random() < 0.85
            target = 0

        # Boundary clamping to physiological limits
        bmi = max(14.0, min(65.0, bmi))

        record = {
            "record_id": f"SYN-DIA-{i+1:04d}",
            "schema_version": "v1.0.0",
            "provenance": {
                "source": random.choice(["manual_entry", "clinical_ehr_import"]),
                "patient_confirmed": True,
                "entered_at": "2026-11-10T10:00:00Z"
            },
            "age": age,
            "sex": random.choice(["male", "female"]),
            "bmi": bmi,
            "high_bp": high_bp,
            "high_chol": high_chol,
            "chol_check_5yr": random.random() < 0.90,
            "stroke_history": random.random() < (0.12 if is_diabetic_profile else 0.02),
            "heart_disease_or_attack": random.random() < (0.22 if is_diabetic_profile else 0.04),
            "smoker": random.random() < 0.45,
            "phys_activity": phys_activity,
            "fruits_daily": random.random() < 0.65,
            "veggies_daily": random.random() < 0.80,
            "heavy_alcohol": random.random() < 0.06,
            "gen_hlth": gen_hlth,
            "ment_hlth_days": random.randint(0, 30 if is_diabetic_profile else 10),
            "phys_hlth_days": random.randint(0, 30 if is_diabetic_profile else 8),
            "diff_walk": diff_walk,
            "any_healthcare": random.random() < 0.92,
            "no_doc_bc_cost": random.random() < 0.10,
            "education_level": random.randint(2, 6),
            "income_level": random.randint(2, 8),
            "ground_truth_target": target
        }
        records.append(record)

    # Add deliberate boundary edge cases
    # Edge case 1: Minimum allowable bounds
    records.append({
        "record_id": "SYN-DIA-EDGE-MIN",
        "schema_version": "v1.0.0",
        "provenance": {"source": "manual_entry", "patient_confirmed": True, "entered_at": "2026-11-10T10:00:00Z"},
        "age": 18,
        "sex": "female",
        "bmi": 12.0,
        "high_bp": False,
        "high_chol": False,
        "chol_check_5yr": False,
        "stroke_history": False,
        "heart_disease_or_attack": False,
        "smoker": False,
        "phys_activity": True,
        "fruits_daily": True,
        "veggies_daily": True,
        "heavy_alcohol": False,
        "gen_hlth": 1,
        "ment_hlth_days": 0,
        "phys_hlth_days": 0,
        "diff_walk": False,
        "any_healthcare": True,
        "no_doc_bc_cost": False,
        "education_level": 1,
        "income_level": 1,
        "ground_truth_target": 0
    })

    # Edge case 2: Maximum allowable bounds
    records.append({
        "record_id": "SYN-DIA-EDGE-MAX",
        "schema_version": "v1.0.0",
        "provenance": {"source": "manual_entry", "patient_confirmed": True, "entered_at": "2026-11-10T10:00:00Z"},
        "age": 100,
        "sex": "male",
        "bmi": 70.0,
        "high_bp": True,
        "high_chol": True,
        "chol_check_5yr": True,
        "stroke_history": True,
        "heart_disease_or_attack": True,
        "smoker": True,
        "phys_activity": False,
        "fruits_daily": False,
        "veggies_daily": False,
        "heavy_alcohol": True,
        "gen_hlth": 5,
        "ment_hlth_days": 30,
        "phys_hlth_days": 30,
        "diff_walk": True,
        "any_healthcare": True,
        "no_doc_bc_cost": True,
        "education_level": 6,
        "income_level": 8,
        "ground_truth_target": 1
    })

    return records


def generate_invalid_diabetes_records() -> List[Dict[str, Any]]:
    """
    Generate negative-test payloads with physiological out-of-bounds to verify Pydantic rejection.
    """
    base_valid = {
        "schema_version": "v1.0.0",
        "provenance": {"source": "manual_entry", "patient_confirmed": True, "entered_at": "2026-11-10T10:00:00Z"},
        "age": 45,
        "sex": "male",
        "bmi": 26.5,
        "high_bp": False,
        "high_chol": False,
        "chol_check_5yr": True,
        "stroke_history": False,
        "heart_disease_or_attack": False,
        "smoker": False,
        "phys_activity": True,
        "fruits_daily": True,
        "veggies_daily": True,
        "heavy_alcohol": False,
        "gen_hlth": 2,
        "ment_hlth_days": 2,
        "phys_hlth_days": 1,
        "diff_walk": False,
        "any_healthcare": True,
        "no_doc_bc_cost": False,
        "education_level": 4,
        "income_level": 5
    }

    invalids = [
        {"test_case": "age_below_minimum", "payload": {**base_valid, "age": 15}, "expected_field": "age"},
        {"test_case": "age_above_maximum", "payload": {**base_valid, "age": 125}, "expected_field": "age"},
        {"test_case": "bmi_below_physio", "payload": {**base_valid, "bmi": 8.5}, "expected_field": "bmi"},
        {"test_case": "bmi_above_physio", "payload": {**base_valid, "bmi": 95.0}, "expected_field": "bmi"},
        {"test_case": "gen_hlth_out_of_scale", "payload": {**base_valid, "gen_hlth": 9}, "expected_field": "gen_hlth"},
        {"test_case": "negative_mental_days", "payload": {**base_valid, "ment_hlth_days": -4}, "expected_field": "ment_hlth_days"},
        {"test_case": "mental_days_over_30", "payload": {**base_valid, "ment_hlth_days": 35}, "expected_field": "ment_hlth_days"},
        {"test_case": "invalid_sex_enum", "payload": {**base_valid, "sex": "unknown_value"}, "expected_field": "sex"},
    ]
    return invalids


def generate_synthetic_cardiovascular_records(n_records: int = 150) -> List[Dict[str, Any]]:
    """
    Generate synthetic records matching the UCI Cleveland clinical feature distributions.
    """
    records = []
    for i in range(n_records):
        # 45% synthetic stenosis target probability
        has_stenosis = random.random() < 0.45

        if has_stenosis:
            age = random.randint(50, 78)
            sex = "male" if random.random() < 0.75 else "female"
            chest_pain_type = random.choice([3, 4, 4])  # Often asymptomatic or non-anginal in CAD referral
            resting_bp = int(np.random.normal(142, 18))
            cholesterol = int(np.random.normal(265, 45))
            fbs = random.random() < 0.22
            resting_ecg = random.choice([0, 1, 2])
            max_heart_rate = int(np.random.normal(135, 20))
            exang = random.random() < 0.60
            oldpeak = round(float(np.random.exponential(1.6)), 1)
            st_slope = random.choice([2, 3])  # Flat or downsloping
            ca = random.choice([1, 2, 3])
            thal = random.choice([6, 7])      # Fixed or reversible defect
            target = 1
        else:
            age = random.randint(25, 62)
            sex = "male" if random.random() < 0.55 else "female"
            chest_pain_type = random.choice([1, 2, 3])
            resting_bp = int(np.random.normal(124, 14))
            cholesterol = int(np.random.normal(218, 35))
            fbs = random.random() < 0.10
            resting_ecg = random.choice([0, 0, 1])
            max_heart_rate = int(np.random.normal(162, 18))
            exang = random.random() < 0.15
            oldpeak = round(float(np.random.exponential(0.4)), 1)
            st_slope = random.choice([1, 1, 2])  # Upsloping or flat
            ca = 0
            thal = 3  # Normal
            target = 0

        # Boundary clamping to physiological limits
        resting_bp = max(80, min(230, resting_bp))
        cholesterol = max(110, min(550, cholesterol))
        max_heart_rate = max(60, min(220, max_heart_rate))
        oldpeak = max(0.0, min(8.0, oldpeak))

        record = {
            "record_id": f"SYN-CVD-{i+1:04d}",
            "schema_version": "v1.0.0",
            "provenance": {
                "source": random.choice(["manual_entry", "clinical_ehr_import"]),
                "patient_confirmed": True,
                "entered_at": "2026-11-10T10:00:00Z"
            },
            "age": age,
            "sex": sex,
            "chest_pain_type": chest_pain_type,
            "resting_bp": resting_bp,
            "cholesterol": cholesterol,
            "fasting_blood_sugar_gt_120": fbs,
            "resting_ecg": resting_ecg,
            "max_heart_rate": max_heart_rate,
            "exercise_induced_angina": exang,
            "st_depression": oldpeak,
            "st_slope": st_slope,
            "num_major_vessels": ca,
            "thalassemia": thal,
            "ground_truth_target": target
        }
        records.append(record)

    # Edge cases
    records.append({
        "record_id": "SYN-CVD-EDGE-MIN",
        "schema_version": "v1.0.0",
        "provenance": {"source": "manual_entry", "patient_confirmed": True, "entered_at": "2026-11-10T10:00:00Z"},
        "age": 18,
        "sex": "female",
        "chest_pain_type": 1,
        "resting_bp": 60,
        "cholesterol": 80,
        "fasting_blood_sugar_gt_120": False,
        "resting_ecg": 0,
        "max_heart_rate": 50,
        "exercise_induced_angina": False,
        "st_depression": 0.0,
        "st_slope": 1,
        "num_major_vessels": 0,
        "thalassemia": 3,
        "ground_truth_target": 0
    })

    records.append({
        "record_id": "SYN-CVD-EDGE-MAX",
        "schema_version": "v1.0.0",
        "provenance": {"source": "manual_entry", "patient_confirmed": True, "entered_at": "2026-11-10T10:00:00Z"},
        "age": 100,
        "sex": "male",
        "chest_pain_type": 4,
        "resting_bp": 260,
        "cholesterol": 650,
        "fasting_blood_sugar_gt_120": True,
        "resting_ecg": 2,
        "max_heart_rate": 250,
        "exercise_induced_angina": True,
        "st_depression": 10.0,
        "st_slope": 3,
        "num_major_vessels": 3,
        "thalassemia": 7,
        "ground_truth_target": 1
    })

    return records


def generate_invalid_cardiovascular_records() -> List[Dict[str, Any]]:
    """
    Generate negative-test payloads with physiological out-of-bounds to verify Pydantic rejection.
    """
    base_valid = {
        "schema_version": "v1.0.0",
        "provenance": {"source": "manual_entry", "patient_confirmed": True, "entered_at": "2026-11-10T10:00:00Z"},
        "age": 55,
        "sex": "male",
        "chest_pain_type": 2,
        "resting_bp": 130,
        "cholesterol": 220,
        "fasting_blood_sugar_gt_120": False,
        "resting_ecg": 0,
        "max_heart_rate": 150,
        "exercise_induced_angina": False,
        "st_depression": 1.2,
        "st_slope": 1,
        "num_major_vessels": 0,
        "thalassemia": 3
    }

    invalids = [
        {"test_case": "age_below_18", "payload": {**base_valid, "age": 14}, "expected_field": "age"},
        {"test_case": "resting_bp_below_60", "payload": {**base_valid, "resting_bp": 45}, "expected_field": "resting_bp"},
        {"test_case": "resting_bp_above_260", "payload": {**base_valid, "resting_bp": 310}, "expected_field": "resting_bp"},
        {"test_case": "cholesterol_below_80", "payload": {**base_valid, "cholesterol": 50}, "expected_field": "cholesterol"},
        {"test_case": "cholesterol_above_650", "payload": {**base_valid, "cholesterol": 800}, "expected_field": "cholesterol"},
        {"test_case": "cp_out_of_range", "payload": {**base_valid, "chest_pain_type": 5}, "expected_field": "chest_pain_type"},
        {"test_case": "thal_invalid_code", "payload": {**base_valid, "thalassemia": 4}, "expected_field": "thalassemia"},
        {"test_case": "st_depression_negative", "payload": {**base_valid, "st_depression": -2.0}, "expected_field": "st_depression"},
        {"test_case": "st_depression_above_10", "payload": {**base_valid, "st_depression": 15.5}, "expected_field": "st_depression"},
    ]
    return invalids


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    synthetic_dir = os.path.join(base_dir, "data", "synthetic")
    os.makedirs(synthetic_dir, exist_ok=True)

    print("Generating synthetic datasets for SwasthyaCare ML workstreams...")

    # 1. Diabetes Records
    dia_records = generate_synthetic_diabetes_records(250)
    dia_json_path = os.path.join(synthetic_dir, "diabetes_valid_records.json")
    with open(dia_json_path, "w") as f:
        json.dump(dia_records, f, indent=2)

    dia_df = pd.DataFrame(dia_records)
    dia_csv_path = os.path.join(synthetic_dir, "diabetes_valid_records.csv")
    dia_df.to_csv(dia_csv_path, index=False)
    print(f"Generated {len(dia_records)} synthetic diabetes records -> {dia_json_path}")

    dia_invalids = generate_invalid_diabetes_records()
    dia_invalid_path = os.path.join(synthetic_dir, "diabetes_invalid_records.json")
    with open(dia_invalid_path, "w") as f:
        json.dump(dia_invalids, f, indent=2)
    print(f"Generated {len(dia_invalids)} invalid diabetes test cases -> {dia_invalid_path}")

    # 2. Cardiovascular Records
    cvd_records = generate_synthetic_cardiovascular_records(200)
    cvd_json_path = os.path.join(synthetic_dir, "cardiovascular_valid_records.json")
    with open(cvd_json_path, "w") as f:
        json.dump(cvd_records, f, indent=2)

    cvd_df = pd.DataFrame(cvd_records)
    cvd_csv_path = os.path.join(synthetic_dir, "cardiovascular_valid_records.csv")
    cvd_df.to_csv(cvd_csv_path, index=False)
    print(f"Generated {len(cvd_records)} synthetic cardiovascular records -> {cvd_json_path}")

    cvd_invalids = generate_invalid_cardiovascular_records()
    cvd_invalid_path = os.path.join(synthetic_dir, "cardiovascular_invalid_records.json")
    with open(cvd_invalid_path, "w") as f:
        json.dump(cvd_invalids, f, indent=2)
    print(f"Generated {len(cvd_invalids)} invalid cardiovascular test cases -> {cvd_invalid_path}")

    print("Synthetic dataset generation completed successfully.")


if __name__ == "__main__":
    main()
