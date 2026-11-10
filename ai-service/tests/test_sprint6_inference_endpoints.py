"""
SwasthyaCare AI Service — Sprint 6 Integration Test Suite
Tasks: ML-S6-01 through ML-S6-09
Tests FastAPI internal assessment endpoints, authentication, input validation,
calibration outputs, and error handling.
"""

import os
import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import pytest
from starlette.testclient import TestClient
from app.main import app
from app.core.security import DEFAULT_INTERNAL_SECRET

client = TestClient(app)
VALID_HEADERS = {"X-Internal-Service-Key": DEFAULT_INTERNAL_SECRET}
INVALID_HEADERS = {"X-Internal-Service-Key": "invalid-secret-key-xyz"}


def test_internal_health_requires_authentication():
    """ML-S6-07: Internal health endpoint rejects unauthenticated requests."""
    # 1. Missing header
    res_no_auth = client.get("/internal/v1/health")
    assert res_no_auth.status_code == 403
    assert res_no_auth.json()["detail"]["error"] == "FORBIDDEN_INTERNAL_ACCESS"

    # 2. Invalid secret
    res_bad_auth = client.get("/internal/v1/health", headers=INVALID_HEADERS)
    assert res_bad_auth.status_code == 403
    assert res_bad_auth.json()["detail"]["error"] == "FORBIDDEN_INTERNAL_ACCESS"


def test_internal_health_with_valid_key():
    """ML-S6-08: Internal health endpoint returns operational status and model readiness."""
    response = client.get("/internal/v1/health", headers=VALID_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["service"] == "SwasthyaCare AI Inference Microservice"
    assert data["models_loaded"]["ML-DIA-01"] is True
    assert data["models_loaded"]["ML-CVD-01"] is True
    assert "ML-DIA-01" in data["metadata"]
    assert "ML-CVD-01" in data["metadata"]


def test_diabetes_endpoint_authentication():
    """ML-S6-07: Diabetes assessment endpoint enforces secret authentication."""
    sample_payload = {
        "age": 45,
        "sex": "female",
        "bmi": 24.5,
        "high_bp": False,
        "high_chol": False,
        "smoker": False,
        "phys_activity": True,
        "fruits_daily": True,
        "veggies_daily": True,
        "gen_hlth": 2,
        "ment_hlth_days": 0,
        "phys_hlth_days": 0
    }
    response = client.post("/internal/v1/assessments/diabetes/current-status", json=sample_payload)
    assert response.status_code == 403


def test_diabetes_endpoint_successful_prediction():
    """ML-S6-01 & ML-S6-05: Diabetes endpoint validates payload and returns calibrated decision support."""
    payload = {
        "age": 55,
        "sex": "male",
        "bmi": 32.4,
        "high_bp": True,
        "high_chol": True,
        "chol_check_5yr": True,
        "stroke_history": False,
        "heart_disease_or_attack": False,
        "smoker": True,
        "phys_activity": False,
        "fruits_daily": False,
        "veggies_daily": True,
        "heavy_alcohol": False,
        "gen_hlth": 4,
        "ment_hlth_days": 10,
        "phys_hlth_days": 15,
        "diff_walk": True,
        "any_healthcare": True,
        "no_doc_bc_cost": False,
        "education_level": 4,
        "income_level": 3
    }
    response = client.post(
        "/internal/v1/assessments/diabetes/current-status",
        headers=VALID_HEADERS,
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == "ML-DIA-01"
    assert data["model_id"] == "diabetes-current-status-lr"
    assert data["model_version"] == "1.0.0"
    assert data["assessment_status"] == "completed"
    assert data["prediction"] in [0, 1]
    assert 0.0 <= data["probability"] <= 1.0
    assert "Reported Profile" in data["output_label"]
    assert len(data["contributing_factors"]) > 0
    assert len(data["lifestyle_recommendations"]) > 0
    assert len(data["limitations"]) > 0
    assert "EDUCATIONAL PROTOTYPE ONLY" in data["disclaimer"]


def test_diabetes_endpoint_input_validation():
    """ML-S6-06: Diabetes endpoint rejects biologically implausible inputs."""
    # Out-of-bounds BMI (> 70.0 kg/m²)
    payload_invalid_bmi = {
        "age": 40,
        "sex": "female",
        "bmi": 95.0,
        "high_bp": False,
        "high_chol": False,
        "smoker": False,
        "phys_activity": True,
        "fruits_daily": True,
        "veggies_daily": True,
        "gen_hlth": 2,
        "ment_hlth_days": 0,
        "phys_hlth_days": 0
    }
    res = client.post(
        "/internal/v1/assessments/diabetes/current-status",
        headers=VALID_HEADERS,
        json=payload_invalid_bmi
    )
    assert res.status_code == 422

    # Underage (< 18 years)
    payload_underage = {
        "age": 14,
        "sex": "female",
        "bmi": 21.0,
        "high_bp": False,
        "high_chol": False,
        "smoker": False,
        "phys_activity": True,
        "fruits_daily": True,
        "veggies_daily": True,
        "gen_hlth": 2,
        "ment_hlth_days": 0,
        "phys_hlth_days": 0
    }
    res = client.post(
        "/internal/v1/assessments/diabetes/current-status",
        headers=VALID_HEADERS,
        json=payload_underage
    )
    assert res.status_code == 422


def test_cardiovascular_endpoint_successful_prediction():
    """ML-S6-02 & ML-S6-05: Cardiovascular endpoint processes clinical biomarkers with non-diagnostic labels."""
    payload = {
        "age": 62,
        "sex": "male",
        "chest_pain_type": 4,
        "resting_bp": 145,
        "cholesterol": 280,
        "fasting_blood_sugar_gt_120": True,
        "resting_ecg": 2,
        "max_heart_rate": 128,
        "exercise_induced_angina": True,
        "st_depression": 2.4,
        "st_slope": 2,
        "num_major_vessels": 2,
        "thalassemia": 7
    }
    response = client.post(
        "/internal/v1/assessments/cardiovascular/current-status",
        headers=VALID_HEADERS,
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == "ML-CVD-01"
    assert data["model_id"] == "cardiovascular-current-status-rf"
    assert data["model_version"] == "1.0.0"
    assert data["assessment_status"] == "completed"
    assert data["prediction"] in [0, 1]
    assert 0.0 <= data["probability"] <= 1.0
    assert "Biomarker Pattern" in data["output_label"]
    assert len(data["contributing_factors"]) > 0
    assert len(data["clinical_recommendations"]) > 0
    assert len(data["limitations"]) > 0
    assert "EDUCATIONAL PROTOTYPE ONLY" in data["disclaimer"]


def test_cardiovascular_endpoint_input_validation():
    """ML-S6-06: Cardiovascular endpoint validates strict categorical and continuous ranges."""
    # Invalid Thalassemia code (5 is not in [3, 6, 7])
    payload_bad_thal = {
        "age": 50,
        "sex": "male",
        "chest_pain_type": 2,
        "resting_bp": 120,
        "cholesterol": 200,
        "fasting_blood_sugar_gt_120": False,
        "resting_ecg": 0,
        "max_heart_rate": 150,
        "exercise_induced_angina": False,
        "st_depression": 0.0,
        "st_slope": 1,
        "num_major_vessels": 0,
        "thalassemia": 5
    }
    res = client.post(
        "/internal/v1/assessments/cardiovascular/current-status",
        headers=VALID_HEADERS,
        json=payload_bad_thal
    )
    assert res.status_code == 422

    # Blood pressure exceeding ceiling (> 260 mmHg)
    payload_bad_bp = {
        "age": 50,
        "sex": "male",
        "chest_pain_type": 2,
        "resting_bp": 300,
        "cholesterol": 200,
        "fasting_blood_sugar_gt_120": False,
        "resting_ecg": 0,
        "max_heart_rate": 150,
        "exercise_induced_angina": False,
        "st_depression": 0.0,
        "st_slope": 1,
        "num_major_vessels": 0,
        "thalassemia": 3
    }
    res = client.post(
        "/internal/v1/assessments/cardiovascular/current-status",
        headers=VALID_HEADERS,
        json=payload_bad_bp
    )
    assert res.status_code == 422
