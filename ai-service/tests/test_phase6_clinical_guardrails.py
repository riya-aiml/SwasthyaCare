"""
SwasthyaCare AI Service — Phase 6 Clinical Safety Guardrails & Negation Tests
Sprint 10 / Phase 6 Clinical Hardening
Verifies:
1. Contextual negation detection for red-flag symptoms (prevents false-positive P0 lockouts).
2. Pseudo-negation handling ("not stopping", "not relieved by rest" remain affirmative emergencies).
3. Vernacular Hindi / Hinglish negation ("chhati me dard nahi hai").
4. Structured SOCRATES clinical clarification for non-emergency acute complaints.
5. Educational pharmacology (Mechanism of Action, side effects, administration) vs prescriptive refusal.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from app.services.clinical_guardrails import (
    ClinicalNegationDetector,
    SymptomClarifier,
    EducationalPharmacologyEngine,
)
from app.services.chat_rag_service import IntentClassifier, chat_rag_service
from app.schemas.chat_assistant import ChatIntent, ChatOrchestrationRequest
from app.core.security import DEFAULT_INTERNAL_SECRET


class TestPhase6ClinicalGuardrails:

    def setup_method(self):
        self.client = TestClient(app)
        self.secret = DEFAULT_INTERNAL_SECRET

    # ========================================================
    # 1. NEGATION HANDLING IN RED-FLAG TRIAGE (PREVENTS FALSE POSITIVES)
    # ========================================================
    def test_negated_chest_pain_english(self):
        """Negated chest pain is NOT flagged as a clinical emergency."""
        msg = "I do not have any chest pain, I just have a rash on my left arm"
        assert IntentClassifier.detect_emergency(msg) is False
        assert IntentClassifier.classify_intent(msg) != ChatIntent.INTENT_EMERGENCY

    def test_negated_shortness_of_breath_denies(self):
        """Clinical phrasing 'denies shortness of breath' is marked negated."""
        msg = "Patient denies shortness of breath or difficulty breathing, presenting with mild fever"
        assert IntentClassifier.detect_emergency(msg) is False

    def test_negated_multiple_symptoms(self):
        """Preceding 'no' negates both symptoms in context window."""
        msg = "No chest pain, no breathing difficulty, just mild knee pain"
        assert IntentClassifier.detect_emergency(msg) is False

    def test_negated_vernacular_hindi(self):
        """Hindi post-negation 'nahi hai' prevents emergency false positives."""
        msg = "Seene me koi dard nahi hai, bas thoda bukhar hai"
        assert IntentClassifier.detect_emergency(msg) is False

        msg2 = "Chhati me dard nahi ho raha, gale me kharash hai"
        assert IntentClassifier.detect_emergency(msg2) is False

    # ========================================================
    # 2. AFFIRMATIVE EMERGENCIES & PSEUDO-NEGATIONS
    # ========================================================
    def test_affirmative_crushing_chest_pain(self):
        """Affirmative severe chest pain is flagged as emergency P0."""
        msg = "I have crushing chest pain radiating to my left arm and jaw"
        assert IntentClassifier.detect_emergency(msg) is True
        assert IntentClassifier.classify_intent(msg) == ChatIntent.INTENT_EMERGENCY

    def test_pseudo_negation_not_stopping(self):
        """Phrase 'not stopping' is a pseudo-negation that must NOT cancel emergency."""
        msg = "My chest pain is severe and not stopping since 30 minutes"
        assert IntentClassifier.detect_emergency(msg) is True

    def test_pseudo_negation_not_relieved(self):
        """Phrase 'not relieved' confirms acute clinical emergency."""
        msg = "Severe shortness of breath not relieved by sitting upright"
        assert IntentClassifier.detect_emergency(msg) is True

    def test_affirmative_vernacular_emergency(self):
        """Affirmative vernacular chest pain triggers emergency P0."""
        msg = "Mere seene me bohot tezz dard ho raha hai"
        assert IntentClassifier.detect_emergency(msg) is True

    # ========================================================
    # 3. STRUCTURED SYMPTOM CLARIFICATION (SOCRATES)
    # ========================================================
    def test_headache_triggers_socrates_assessment(self):
        """Mild headache complaint triggers structured SOCRATES assessment questions."""
        symptom = SymptomClarifier.detect_mild_symptom("I have had a headache since morning")
        assert symptom == "headache"
        guidance = SymptomClarifier.generate_socrates_clarification(symptom, "headache since morning")
        assert "SOCRATES" in guidance
        assert "Site & Spread" in guidance
        assert "Onset & Duration" in guidance
        assert "Severity" in guidance
        assert "Warning Red Flags" in guidance
        assert "112 / 108" in guidance

    def test_abdominal_pain_socrates_clarification(self):
        """Abdominal ache query triggers structured SOCRATES clarification."""
        symptom = SymptomClarifier.detect_mild_symptom("My stomach is hurting for the past 2 hours")
        assert symptom == "abdominal_pain"
        guidance = SymptomClarifier.generate_socrates_clarification(symptom, "stomach is hurting")
        assert "stomach discomfort" in guidance
        assert "OPD consultation" in guidance

    # ========================================================
    # 4. EDUCATIONAL PHARMACOLOGY VS PRESCRIPTION REFUSAL
    # ========================================================
    def test_educational_metformin_summary(self):
        """Educational inquiry returns Biguanide MOA and administration principles."""
        summary = EducationalPharmacologyEngine.get_educational_summary("metformin")
        assert summary is not None
        assert "Biguanide" in summary
        assert "hepatic glucose production" in summary
        assert "with or after meals" in summary
        assert "Safety Advisory" in summary

    def test_educational_telmisartan_summary(self):
        """Educational inquiry returns ARB MOA and side effects."""
        summary = EducationalPharmacologyEngine.get_educational_summary("telmisartan")
        assert summary is not None
        assert "Angiotensin II Receptor Blocker" in summary
        assert "vasodilation" in summary
        assert "Dizziness" in summary

    def test_prescription_attempt_is_strictly_refused(self):
        """Prescription or dosage alteration request triggers strict refusal."""
        assert IntentClassifier.detect_prescription_request("What dose of Metformin should I take?") is True
        assert IntentClassifier.detect_prescription_request("Can I stop taking my blood pressure medication?") is True
        assert IntentClassifier.detect_prescription_request("Doctor sahab mujhe bp ki konsi dawa leni chahiye?") is True

    # ========================================================
    # 5. END-TO-END ORCHESTRATION WITH PHASE 6 GUARDRAILS
    # ========================================================
    def test_orchestration_negated_chest_pain_patient(self):
        """RPC: Patient denying chest pain is NOT routed to emergency lock-out."""
        payload = {
            "user_id": "6732f1a9b2c3d4e5f6000001",
            "user_role": "patient",
            "message": "I do not have any chest pain, I just want to learn about healthy diet",
            "conversation_history": [],
            "patient_context": {},
        }
        resp = self.client.post(
            "/api/v1/chat/internal-orchestrate",
            headers={"X-Internal-Service-Key": self.secret},
            json=payload,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_emergency"] is False
        assert data["intent"] != "INTENT_EMERGENCY"

    def test_orchestration_educational_pharmacology(self):
        """RPC: Educational inquiry on Telmisartan returns pharmacology summary."""
        payload = {
            "user_id": "6732f1a9b2c3d4e5f6000001",
            "user_role": "patient",
            "message": "What is the mechanism of action of Telmisartan?",
            "conversation_history": [],
            "patient_context": {},
        }
        resp = self.client.post(
            "/api/v1/chat/internal-orchestrate",
            headers={"X-Internal-Service-Key": self.secret},
            json=payload,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "angiotensin ii receptor blocker" in data["response_text"].lower()
        assert "safety" in data["response_text"].lower()
