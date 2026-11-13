import pytest
from app.schemas.recovery_assessment import RecoveryRiskRequest
from app.services.recovery_risk_service import recovery_risk_service

def test_stable_recovery_evaluation():
    req = RecoveryRiskRequest(
        recovery_rating=5,
        pain_level=1,
        mobility_score="Normal",
        systolic_bp=120,
        diastolic_bp=80,
        heart_rate=72,
        temperature_celsius=36.7,
        oxygen_saturation=99,
        medication_adherence="Full",
        patient_notes="Walking comfortably in the garden, no issues."
    )
    res = recovery_risk_service.assess_risk(req)
    assert res.risk_tier == "STABLE"
    assert res.risk_score < 30.0
    assert res.health_index >= 70.0
    assert res.requires_escalation is False
    assert len(res.nlp_detected_alerts) == 0

def test_critical_vital_and_warning_symptoms():
    req = RecoveryRiskRequest(
        recovery_rating=1,
        pain_level=9,
        mobility_score="Bedridden",
        systolic_bp=182,
        diastolic_bp=108,
        heart_rate=128,
        temperature_celsius=39.2,
        oxygen_saturation=88,
        medication_adherence="None",
        has_warning_symptoms=True,
        patient_notes="Incision is oozing yellow pus, red streaks spreading, having trouble breathing."
    )
    res = recovery_risk_service.assess_risk(req)
    assert res.risk_tier == "CRITICAL_ATTENTION"
    assert res.risk_score >= 65.0
    assert res.requires_escalation is True
    assert len(res.nlp_detected_alerts) >= 2
    assert any("Infection" in alert or "Erythema" in alert for alert in res.nlp_detected_alerts)
    assert any("Respiratory" in alert for alert in res.nlp_detected_alerts)

def test_pain_trajectory_elevation():
    req = RecoveryRiskRequest(
        recovery_rating=3,
        pain_level=7,
        previous_pain_level=3, # +4 delta jump
        mobility_score="Slightly Restricted",
        systolic_bp=135,
        heart_rate=80,
        temperature_celsius=37.1,
        medication_adherence="Partial",
        patient_notes="Pain spiked since morning."
    )
    res = recovery_risk_service.assess_risk(req)
    assert any("Rapid pain escalation" in factor for factor in res.contributing_factors)
    assert res.risk_tier in ["MODERATE_RISK", "CRITICAL_ATTENTION"]
