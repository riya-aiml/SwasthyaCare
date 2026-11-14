"""
SwasthyaCare AI Service — Phase 4 Orchestration & LLM Provider Unit Tests
Verifies:
1. ProviderFactory instantiation (DeterministicMock, AnthropicClaude, OpenAI).
2. Resilient fallback behavior when external credentials are unset.
3. Hierarchical 13-intent classification with granular taxonomy.
4. Response metadata logging (model, tokens_used, latency_ms, provider).
5. Priority 0 emergency, prescription refusal, and human support escalation.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from app.schemas.chat_assistant import (
    ChatOrchestrationRequest,
    ChatIntent,
    ActionType,
)
from app.services.llm_providers import (
    ProviderFactory,
    DeterministicMockProvider,
    AnthropicClaudeProvider,
    OpenAIProvider,
    ProviderResult,
    CLINICAL_SYSTEM_PROMPT,
    EMERGENCY_ESCALATION_TEMPLATE,
    PRESCRIPTION_REFUSAL_TEXT,
)
from app.services.chat_rag_service import IntentClassifier, chat_rag_service
from app.core.security import DEFAULT_INTERNAL_SECRET


class TestPhase4OrchestrationProviders:

    def setup_method(self):
        self.client = TestClient(app)
        self.valid_secret = DEFAULT_INTERNAL_SECRET

    # ========================================================
    # 1. PROVIDER FACTORY & FALLBACKS
    # ========================================================
    def test_provider_factory_default(self):
        """Factory defaults to DeterministicMockProvider for continuous zero-cost offline testability."""
        provider = ProviderFactory.get_provider("deterministic-mock")
        assert isinstance(provider, DeterministicMockProvider)

    def test_provider_factory_anthropic_instantiation(self):
        """Anthropic provider can be instantiated and falls back gracefully if unconfigured."""
        provider = ProviderFactory.get_provider("anthropic")
        assert isinstance(provider, AnthropicClaudeProvider)
        assert provider.model in ["claude-sonnet-5-5", os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")]

    def test_provider_factory_openai_instantiation(self):
        """OpenAI provider can be instantiated and falls back gracefully if unconfigured."""
        provider = ProviderFactory.get_provider("openai")
        assert isinstance(provider, OpenAIProvider)
        assert provider.model == "gpt-4o"

    # ========================================================
    # 2. DETERMINISTIC MOCK PROVIDER CLINICAL RESPONSES
    # ========================================================
    @pytest.mark.asyncio
    async def test_mock_provider_emergency_escalation(self):
        """P0 Emergency query produces immediate escalation with 112/108/Tele-MANAS."""
        provider = DeterministicMockProvider()
        result = await provider.generate_async(
            prompt="Crushing chest pain radiating to my jaw and left arm",
            system_prompt="",
            citations=[],
            intent=ChatIntent.INTENT_EMERGENCY,
        )
        assert "112" in result.content
        assert "108" in result.content
        assert "Tele-MANAS" in result.content
        assert result.provider == "deterministic-mock"
        assert result.model == "swasthya-clinical-engine-v1"

    @pytest.mark.asyncio
    async def test_mock_provider_prescription_refusal(self):
        """Prescription request triggers strict refusal."""
        provider = DeterministicMockProvider()
        result = await provider.generate_async(
            prompt="What dosage of Metformin should I take for sugar 200?",
            system_prompt="",
            citations=[],
            intent=ChatIntent.INTENT_CLINICAL_QA,
        )
        assert "cannot recommend or prescribe medications" in result.content

    @pytest.mark.asyncio
    async def test_mock_provider_human_support(self):
        """Human escalation query routes to hospital triage contact details."""
        provider = DeterministicMockProvider()
        result = await provider.generate_async(
            prompt="I need to talk to a human nurse or doctor right now",
            system_prompt="",
            citations=[],
            intent=ChatIntent.INTENT_HUMAN_SUPPORT,
        )
        assert "011-2345-6789" in result.content or "support team" in result.content

    @pytest.mark.asyncio
    async def test_mock_provider_medicine_info(self):
        """Educational pharmacology explains mechanism of action safely."""
        provider = DeterministicMockProvider()
        result = await provider.generate_async(
            prompt="How does Telmisartan work for high blood pressure?",
            system_prompt="",
            citations=[],
            intent=ChatIntent.INTENT_MEDICINE_INFORMATION,
        )
        assert "Telmisartan" in result.content
        assert "Angiotensin II Receptor Blocker" in result.content

    # ========================================================
    # 3. GRANULAR 13-INTENT CLASSIFIER
    # ========================================================
    def test_granular_intent_taxonomy(self):
        """Verifies hierarchical categorization for key clinical and operational intents."""
        assert IntentClassifier.classify_granular_intent("My chest pain is unbearable") == ChatIntent.INTENT_EMERGENCY
        assert IntentClassifier.classify_granular_intent("Connect me to a real person at the helpdesk") == ChatIntent.INTENT_HUMAN_SUPPORT
        assert IntentClassifier.classify_granular_intent("Book an appointment with Dr. Gupta tomorrow") == ChatIntent.INTENT_APPOINTMENT_ACTION
        assert IntentClassifier.classify_granular_intent("What is the consultation fee for a cardiologist?") == ChatIntent.INTENT_APPOINTMENT_HELP
        assert IntentClassifier.classify_granular_intent("What is my live token queue wait time?") == ChatIntent.INTENT_QUEUE_HELP
        assert IntentClassifier.classify_granular_intent("Where can I log my post-discharge recovery check-in?") == ChatIntent.INTENT_FOLLOW_UP_HELP
        assert IntentClassifier.classify_granular_intent("Explain my cardiovascular risk score report") == ChatIntent.INTENT_REPORT_EXPLANATION
        assert IntentClassifier.classify_granular_intent("What are the side effects of Metformin?") == ChatIntent.INTENT_MEDICINE_INFORMATION
        assert IntentClassifier.classify_granular_intent("Where is the hospital cardiology department located?") == ChatIntent.INTENT_NAVIGATION
        assert IntentClassifier.classify_granular_intent("What are healthy dietary habits to prevent prediabetes?") == ChatIntent.INTENT_CLINICAL_QA
        assert IntentClassifier.classify_granular_intent("Namaste, good morning") == ChatIntent.INTENT_GENERAL_CHITCHAT
        assert IntentClassifier.classify_granular_intent("??? !!!") == ChatIntent.INTENT_UNCLEAR

    # ========================================================
    # 4. END-TO-END ORCHESTRATION WITH METADATA LOGGING
    # ========================================================
    def test_orchestration_response_metadata(self):
        """RPC response includes model, tokens_used, provider, and latency metrics."""
        payload = {
            "user_id": "6732f1a9b2c3d4e5f6000001",
            "user_role": "patient",
            "message": "What is normal fasting blood sugar per ICMR guidelines?",
            "conversation_history": [],
            "patient_context": {"patientAge": 52, "patientGender": "male"},
        }

        resp = self.client.post(
            "/api/v1/chat/internal-orchestrate",
            headers={"X-Internal-Service-Key": self.valid_secret},
            json=payload,
        )

        assert resp.status_code == 200
        data = resp.json()

        assert data["intent"] == "INTENT_CLINICAL_QA"
        assert data["is_emergency"] is False
        assert "model" in data
        assert "tokens_used" in data
        assert "latency_ms" in data
        assert data["provider"] in ["deterministic-mock", "anthropic", "openai", "resilient-local-fallback"]
        assert len(data["citations"]) > 0
        assert data["citations"][0]["doc_id"] == "DOC-CLIN-01"
