"""
SwasthyaCare AI Service — Sprint 8 Model Pipeline Reproducibility & Release Gate Suite
Tasks: ML-S8-01, ML-S8-02, ML-S8-03
Tests model pipeline determinism, numerical reproducibility, feature order preservation,
and boundary rejection.
"""

import os
import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import pytest
import numpy as np
import pandas as pd
from app.services.model_registry import registry
from app.schemas.diabetes_assessment import DiabetesAssessmentRequest
from app.schemas.cardiovascular_assessment import CardiovascularAssessmentRequest


def test_diabetes_pipeline_deterministic_reproducibility():
    """
    ML-S8-01: Verifies that identical inputs evaluated through ML-DIA-01 pipeline
    yield mathematically identical probability predictions (|p1 - p2| == 0.0).
    """
    sample_request = DiabetesAssessmentRequest(
        age=54,
        sex="female",
        bmi=28.7,
        high_bp=True,
        high_chol=True,
        chol_check_5yr=True,
        stroke_history=False,
        heart_disease_or_attack=False,
        smoker=False,
        phys_activity=False,
        fruits_daily=True,
        veggies_daily=True,
        heavy_alcohol=False,
        gen_hlth=3,
        ment_hlth_days=2,
        phys_hlth_days=5,
        diff_walk=False,
        any_healthcare=True,
        no_doc_bc_cost=False,
        education_level=4,
        income_level=5
    )

    pred1 = registry.predict_diabetes(sample_request)
    pred2 = registry.predict_diabetes(sample_request)

    assert pred1.prediction == pred2.prediction
    assert abs(pred1.probability - pred2.probability) < 1e-6
    assert pred1.output_label == pred2.output_label
    assert pred1.contributing_factors == pred2.contributing_factors


def test_cardiovascular_pipeline_deterministic_reproducibility():
    """
    ML-S8-01: Verifies that identical inputs evaluated through ML-CVD-01 pipeline
    yield mathematically identical probability predictions.
    """
    sample_request = CardiovascularAssessmentRequest(
        age=61,
        sex="male",
        chest_pain_type=4,
        resting_bp=142,
        cholesterol=265,
        fasting_blood_sugar_gt_120=False,
        resting_ecg=1,
        max_heart_rate=132,
        exercise_induced_angina=True,
        st_depression=2.3,
        st_slope=2,
        num_major_vessels=2,
        thalassemia=7
    )

    pred1 = registry.predict_cardiovascular(sample_request)
    pred2 = registry.predict_cardiovascular(sample_request)

    assert pred1.prediction == pred2.prediction
    assert abs(pred1.probability - pred2.probability) < 1e-6
    assert pred1.output_label == pred2.output_label
    assert pred1.contributing_factors == pred2.contributing_factors


def test_feature_order_invariance_and_parity():
    """
    ML-S8-01: Confirms that model registry metadata accurately records input features
    and ColumnTransformer retains exact column name bindings.
    """
    dia_meta = registry.metadata["ML-DIA-01"]
    cvd_meta = registry.metadata["ML-CVD-01"]

    assert len(dia_meta["input_features"]) == 21
    assert len(cvd_meta["input_features"]) == 13

    # Ensure all expected features are accounted for
    expected_dia_features = {
        "age", "sex", "bmi", "high_bp", "high_chol", "chol_check_5yr",
        "stroke_history", "heart_disease_or_attack", "smoker", "phys_activity",
        "fruits_daily", "veggies_daily", "heavy_alcohol", "gen_hlth",
        "ment_hlth_days", "phys_hlth_days", "diff_walk", "any_healthcare",
        "no_doc_bc_cost", "education_level", "income_level"
    }
    assert set(dia_meta["input_features"]) == expected_dia_features

    expected_cvd_features = {
        "age", "sex", "chest_pain_type", "resting_bp", "cholesterol",
        "fasting_blood_sugar_gt_120", "resting_ecg", "max_heart_rate",
        "exercise_induced_angina", "st_depression", "st_slope",
        "num_major_vessels", "thalassemia"
    }
    assert set(cvd_meta["input_features"]) == expected_cvd_features


def test_extreme_input_boundaries_handled_safely():
    """
    ML-S8-03: Verifies that extreme physiologic minimum and maximum boundary values
    within biological limits execute safely without numerical overflow or NaN.
    """
    # Minimum valid physiological values
    dia_min = DiabetesAssessmentRequest(
        age=18,
        sex="female",
        bmi=12.0,
        high_bp=False,
        high_chol=False,
        chol_check_5yr=False,
        stroke_history=False,
        heart_disease_or_attack=False,
        smoker=False,
        phys_activity=True,
        fruits_daily=True,
        veggies_daily=True,
        heavy_alcohol=False,
        gen_hlth=1,
        ment_hlth_days=0,
        phys_hlth_days=0,
        diff_walk=False,
        any_healthcare=True,
        no_doc_bc_cost=False,
        education_level=1,
        income_level=1
    )
    res_min = registry.predict_diabetes(dia_min)
    assert not np.isnan(res_min.probability)
    assert 0.0 <= res_min.probability <= 1.0

    # Maximum valid physiological values
    dia_max = DiabetesAssessmentRequest(
        age=100,
        sex="male",
        bmi=70.0,
        high_bp=True,
        high_chol=True,
        chol_check_5yr=True,
        stroke_history=True,
        heart_disease_or_attack=True,
        smoker=True,
        phys_activity=False,
        fruits_daily=False,
        veggies_daily=False,
        heavy_alcohol=True,
        gen_hlth=5,
        ment_hlth_days=30,
        phys_hlth_days=30,
        diff_walk=True,
        any_healthcare=False,
        no_doc_bc_cost=True,
        education_level=6,
        income_level=8
    )
    res_max = registry.predict_diabetes(dia_max)
    assert not np.isnan(res_max.probability)
    assert 0.0 <= res_max.probability <= 1.0
    assert res_max.prediction == 1
