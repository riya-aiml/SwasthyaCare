"""
SwasthyaCare AI Service — Classical ML Medical Specialty Classifier Tests
Task: ML-DEP-01
Validates:
1. Pipeline loading, Scikit-Learn TF-IDF vectorizer, and calibrated estimator.
2. Accurate classification across all 8 hospital departments on authentic clinical descriptions.
3. Sub-25ms CPU inference latency and calibrated probability distributions (summing to 1.0).
4. REST API contract for POST /api/v1/predict/department.
5. Integration into ChatRAGService action proposal routing.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from app.services.specialty_classifier import specialty_classifier_service, SpecialtyClassifierService
from app.services.chat_rag_service import ChatRAGService
from app.schemas.chat_assistant import ChatOrchestrationRequest, ChatIntent, ActionType


@pytest.fixture
def client():
    return TestClient(app)


def test_specialty_classifier_initialization():
    """Verify that model artifact loads successfully with all 8 hospital departments."""
    assert specialty_classifier_service.model is not None, "Model pipeline failed to load"
    assert len(specialty_classifier_service.classes) == 8
    expected_classes = {
        "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
        "General_Medicine", "Neurology", "Orthopedics", "Pulmonology"
    }
    assert set(specialty_classifier_service.classes) == expected_classes


@pytest.mark.parametrize("symptom_text, expected_department", [
    ("severe chest pain radiating down left arm with breathlessness and palpitations", "Cardiology"),
    ("skin rash with red itchy patches and scaling on elbows and knees", "Dermatology"),
    ("excessive thirst, frequent urination, and slow wound healing with high glucose", "Endocrinology"),
    ("severe burning stomach acid reflux and abdominal pain after eating", "Gastroenterology"),
    ("chronic persistent cough with thick sputum, wheezing and shortness of breath", "Pulmonology"),
    ("severe knee pain, swollen joints, and painful walking", "Orthopedics"),
    ("severe throbbing headache with visual aura and sensitivity to light", "Neurology"),
    ("high body temperature, shaking chills, and sudden loss of appetite", "General_Medicine"),
])
def test_specialty_classifier_predictions(symptom_text, expected_department):
    """Verify high-confidence classification across authentic clinical symptom narratives."""
    res = specialty_classifier_service.predict(symptom_text)
    assert res["status"] == "success"
    assert res["predicted_department"] == expected_department, (
        f"Expected {expected_department}, got {res['predicted_department']} for: {symptom_text}"
    )
    assert res["confidence"] >= 0.40
    assert res["latency_ms"] < 25.0, f"Inference took too long: {res['latency_ms']}ms"

    # Verify probability distribution
    probs = res["all_probabilities"]
    assert len(probs) == 8
    prob_sum = sum(probs.values())
    assert 0.99 <= prob_sum <= 1.01, f"Probabilities do not sum to 1.0: {prob_sum}"


def test_specialty_classifier_empty_fallback():
    """Verify graceful fallback to General_Medicine when input is empty."""
    res = specialty_classifier_service.predict("")
    assert res["predicted_department"] == "General_Medicine"
    assert res["status"] == "fallback"


def test_api_predict_department_endpoint(client):
    """Verify REST API endpoint POST /api/v1/predict/department."""
    payload = {
        "symptoms": "Severe knee pain, swollen joints, and painful walking"
    }
    resp = client.post("/api/v1/predict/department", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["predicted_department"] == "Orthopedics"
    assert data["confidence"] > 0.50
    assert data["model_task_id"] == "ML-DEP-01"
    assert data["model_version"] == "1.0.0"
    assert "Orthopedics" in data["all_probabilities"]


def test_chat_rag_service_action_routing_with_ml():
    """Verify ChatRAGService uses classical ML to dynamically route appointment booking."""
    service = ChatRAGService()

    # Case 1: Orthopedic symptom action request
    action = service._extract_action_proposal(
        message="I need to book an appointment with a doctor for my severe knee pain and joint stiffness",
        intent=ChatIntent.INTENT_APPOINTMENT_ACTION
    )
    assert action is not None
    assert action.action_type == ActionType.BOOK_APPOINTMENT
    assert action.parameters["department"] == "Orthopedics"
    assert "Dr. Priya Sen" in action.parameters["doctor_name"]
    assert action.parameters["ml_routing_confidence"] >= 0.40

    # Case 2: Cardiology symptom action request
    action_cardio = service._extract_action_proposal(
        message="Please schedule an OPD consultation for tight chest pain and palpitations",
        intent=ChatIntent.INTENT_APPOINTMENT_ACTION
    )
    assert action_cardio is not None
    assert action_cardio.parameters["department"] == "Cardiology"
    assert "Dr. Vikram Anand" in action_cardio.parameters["doctor_name"]
