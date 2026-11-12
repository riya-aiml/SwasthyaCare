"""
============================================================================
SWASTHYACARE AI SERVICE — LLM PROVIDER ADAPTERS & FACTORY
============================================================================
Location: ai-service/app/services/llm_providers.py

HOW THIS FILE WORKS:
1. Pluggable Multi-Provider Architecture:
   - `BaseLLMProvider`: Abstract interface with `generate_async()`.
   - `DeterministicMockProvider`: 100% offline rule-based and guideline-synthesis engine.
     Requires zero API keys, runs with zero latency, and provides complete testability.
   - `AnthropicClaudeProvider`: Live streaming adapter for Anthropic Claude 5 (claude-sonnet-5-5).
   - `OpenAIProvider`: Live adapter for OpenAI GPT-4o / GPT-4.5.
   - `ProviderFactory`: Dynamically selects the provider based on the `LLM_PROVIDER` environment
     variable (defaults to "deterministic-mock").
2. Automatic Resilient Fallback:
   - If Anthropic or OpenAI fails, runs out of quota, or is unconfigured, the system
     automatically falls back to `DeterministicMockProvider` without downtime or crashes.
3. Clinical Grounding:
   - All providers receive retrieved guideline chunks (`citations`) and are instructed
     via `CLINICAL_SYSTEM_PROMPT` to cite source documents [DOC-CLIN-01, DOC-PLAT-01].
============================================================================
"""

import os
import re
import time
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

from app.schemas.chat_assistant import (
    ChatIntent,
    ActionType,
    ActionProposal,
    CitationItem,
    CLINICAL_CHAT_DISCLAIMER,
    PRESCRIPTION_REFUSAL_TEXT,
)
from app.services.hybrid_retrieval import VernacularNormalizer
from app.services.clinical_guardrails import (
    SymptomClarifier,
    EducationalPharmacologyEngine,
)

logger = logging.getLogger("swasthya.llm_providers")

# Clinical Intelligence System Prompt
# Designed to mirror the diagnostic communication standards of premier clinical institutions
# (AIIMS, ICMR, Mayo Clinic, WHO) and leading clinical informatics architectures.
CLINICAL_SYSTEM_PROMPT = (
    "You are the SwasthyaCare AI Health Assistant, a caring, reassuring, and evidence-grounded clinical companion "
    "developed with experienced doctors (AIIMS, ICMR, Mayo Clinic, WHO).\n\n"
    "COMMUNICATION STYLE FOR PATIENTS:\n"
    "1. Demeanor: Warm, empathetic, calm, and reassuring. Speak directly to the patient like an attentive, experienced physician.\n"
    "2. Be Concise & Scannable: Do NOT write intimidating walls of text. Keep paragraphs short (1–3 sentences). Use clean bullet points for steps.\n"
    "3. No Robotic Clichés: Never say 'As an AI...', 'Here is the protocol:', or 'I am a computer program'. Address the patient's human concern with compassion.\n"
    "4. When Booking an Appointment / Inquiring about Symptoms:\n"
    "   - Express genuine empathy for their discomfort.\n"
    "   - Briefly explain what might be happening in simple, non-frightening terms.\n"
    "   - Give 1 or 2 gentle, practical self-care tips they can do immediately (e.g. resting the joint, staying hydrated).\n"
    "   - Let them know you have matched them with an appropriate specialist doctor below to schedule an examination.\n"
    "5. ABSOLUTE PROHIBITION ON LATEX: NEVER use LaTeX math tags ($ ... $, \\text{...}). Write normal text: '120/80 mmHg', '100–125 mg/dL', '< 5g per day'.\n\n"
    "CRITICAL CLINICAL SAFETY RULES:\n"
    "1. NEVER prescribe prescription drugs, give exact drug dosages, or alter medication regimens. Always advise seeing their doctor.\n"
    "2. For acute emergencies (crushing chest pain, difficulty breathing, stroke symptoms, suicidal thoughts), immediately tell them to call 112 / 108 or Tele-MANAS (14416) for urgent emergency care.\n"
    "3. Ground health facts in verified ICMR, WHO, and NIMHANS guidelines, referencing sources with bracket tags like [DOC-CLIN-01] or [DOC-PLAT-01].\n"
    "4. Maintain a culturally attuned, respectful tone suited for Indian dietary habits and lifestyles."
)


def sanitize_clinical_formatting(text: str) -> str:
    """
    Sanitizes LLM outputs to remove LaTeX artifacts, math notation, and raw equation tags,
    converting them into clean, physician-grade medical typography.
    """
    if not text:
        return ""
    # 1. Strip \text{...} and math markers
    text = re.sub(r'\\text\{([^}]+)\}', r'\1', text)
    text = re.sub(r'\$([^$]+)\$', r'\1', text)
    # 2. Standardize mathematical & clinical symbols
    text = text.replace(r'\ge', '≥').replace(r'\le', '≤').replace(r'\pm', '±').replace(r'\times', '×')
    text = text.replace(r'\,', ' ').replace(r'\ ', ' ')
    # 3. Clean up double spaces created by math replacements
    text = re.sub(r'[ \t]+', ' ', text)
    # 4. Remove duplicate blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

# Emergency Escalation Response Template
EMERGENCY_ESCALATION_TEMPLATE = (
    "🚨 **CRITICAL MEDICAL ALERT: IMMEDIATE ACTION REQUIRED**\n\n"
    "Your symptoms indicate a potentially life-threatening medical emergency. "
    "**Please seek immediate emergency medical care.**\n\n"
    "### Emergency Actions:\n"
    "1. **Call Emergency Services IMMEDIATELY:**\n"
    "   - **112** — All-India Unified Emergency Helpline\n"
    "   - **108** — Emergency Medical Services & Ambulance\n"
    "2. **If experiencing a mental health crisis:**\n"
    "   - **14416** / **1800-891-4416** — Tele-MANAS (Toll-Free, 24/7)\n"
    "   - **1800-599-0019** — KIRAN Mental Health Helpline\n"
    "3. **Go to the Nearest Hospital Casualty / Emergency Department.**\n"
    "   Do not wait for symptoms to improve or drive yourself if you are feeling faint or disoriented.\n\n"
    "*Notice: SwasthyaCare Assistant is an automated educational tool, not an emergency medical service.*"
)

NO_EVIDENCE_FALLBACK = (
    "I don't have enough verified clinical information in my guidelines to answer this specific question. "
    "Please consult your physician or specialist for personalized medical guidance."
)


@dataclass
class ProviderResult:
    """Encapsulates the generated text and performance telemetry from any LLM provider."""
    content: str
    provider: str
    model: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    latency_ms: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseLLMProvider(ABC):
    """Abstract Base Class for all SwasthyaCare LLM Providers."""

    @abstractmethod
    async def generate_async(
        self,
        prompt: str,
        system_prompt: str,
        citations: List[Any],
        intent: ChatIntent,
        patient_context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> ProviderResult:
        """Asynchronously generate a clinically grounded response."""
        pass

    def generate(
        self,
        prompt: str,
        system_prompt: str,
        citations: List[Any],
        intent: ChatIntent,
        patient_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Synchronous generation compatibility wrapper."""
        raise NotImplementedError("Use generate_async or DeterministicMockProvider.generate")


class DeterministicMockProvider(BaseLLMProvider):
    """
    Deterministic rule-based and citation-grounded response provider.
    Runs 100% offline with zero dependencies or external API costs.
    Provides complete coverage across all 13 intent classifications.
    """

    def generate(
        self,
        prompt: str,
        system_prompt: str,
        citations: List[Any],
        intent: ChatIntent,
        patient_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        lower = prompt.lower()

        # 1. Emergency Escalation (P0)
        if intent == ChatIntent.INTENT_EMERGENCY:
            return EMERGENCY_ESCALATION_TEMPLATE

        # 2. Prescription & Drug Alteration Refusal
        if self._is_prescription_attempt(lower):
            return (
                f"{PRESCRIPTION_REFUSAL_TEXT}\n\n"
                "If you are experiencing acute discomfort, please visit the hospital or book a consultation "
                "with our specialists."
            )

        # 3. Prompt Injection Deflection
        if self._is_prompt_injection(lower):
            return (
                "I am SwasthyaCare Assistant, a secure clinical and hospital navigation companion. "
                "I focus exclusively on providing verified health guidelines and assisting with SwasthyaCare workflows. "
                "How may I assist your healthcare needs today?"
            )

        # 4. Human Support Escalation
        if intent == ChatIntent.INTENT_HUMAN_SUPPORT or re.search(r"\b(talk to|speak with|connect (me )?to)\s+(human|agent|doctor|nurse|person)\b", lower):
            return (
                "I can connect you with our hospital support team. For urgent clinical queries, our OPD triage desk "
                "is available at **011-2345-6789** (ext. 4). You can also request an in-person or tele-consultation "
                "through our Doctor Booking portal [DOC-PLAT-01]."
            )

        # 5. Greetings & Chitchat
        if intent == ChatIntent.INTENT_GENERAL_CHITCHAT:
            if re.search(r"^(hi|hello|hey|namaste|good\s+morning|good\s+evening)", lower):
                return (
                    "Namaste! I am your SwasthyaCare Assistant. I can help you find doctors, understand "
                    "your appointments, navigate the OPD queue, or learn about diabetes, hypertension, and "
                    "healthy lifestyle guidelines. How can I help you today?"
                )
            if re.search(r"^(thanks|thank\s+you)", lower):
                return "You are very welcome! Take care of your health, and feel free to ask if you need further assistance."
            return (
                "I am dedicated to helping you with health education and SwasthyaCare hospital services. "
                "Please let me know if you have questions about appointments, doctor specialties, or preventive health."
            )

        # 6. Appointment Actions (Booking / Cancellation)
        if intent in [ChatIntent.INTENT_APPOINTMENT_ACTION, ChatIntent.INTENT_APP_ACTION]:
            if "cancel" in lower:
                return (
                    "I can assist you with cancelling your appointment. According to our hospital policy "
                    "[DOC-PLAT-01], appointments can be cancelled up to 24 hours prior to the scheduled slot. "
                    "Please confirm below to proceed with the cancellation."
                )

            # Classical ML specialty routing
            dept_name = "General Medicine"
            try:
                from app.services.specialty_classifier import specialty_classifier_service
                ml_res = specialty_classifier_service.predict(prompt)
                dept_name = ml_res.get("predicted_department", "General_Medicine").replace("_", " ")
            except Exception:
                pass

            return (
                f"Based on your symptoms, your consultation has been matched to our **{dept_name}** department [DOC-PLAT-01]. "
                "I've connected you with our verified specialist for this department. "
                "You can review your consultation details in the specialist card below and confirm your preferred slot."
            )

        # 7. Appointment Help (Guidance without immediate mutation)
        if intent == ChatIntent.INTENT_APPOINTMENT_HELP or re.search(r"\b(how\s+to\s+book|fee|doctor\s+schedule|consultation\s+fee)\b", lower):
            return (
                "SwasthyaCare offers outpatient consultations across General Medicine, Diabetology, and Cardiology [DOC-PLAT-01]. "
                "Standard OPD consultation fees range from ₹300 to ₹500. You can browse doctor profiles, select a slot, "
                "and book directly via our Doctor Discovery tab, or simply ask me to prepare a booking proposal for you."
            )

        # 8. Queue & OPD Token Navigation
        if intent == ChatIntent.INTENT_QUEUE_HELP or ("queue" in lower or "opd" in lower or "token" in lower):
            primary_doc = citations[0].doc_id if citations else "DOC-PLAT-02"
            return (
                "In SwasthyaCare, once you arrive at the clinic, our reception issues you a dynamic digital token. "
                "You can track real-time queue progress and estimated consultation wait times directly on your live "
                f"dashboard [{primary_doc}]. Automated notifications alert you when your turn approaches."
            )

        # 9. Follow-Up & Post-Discharge Care
        if intent == ChatIntent.INTENT_FOLLOW_UP_HELP or ("follow" in lower or "recovery" in lower or "discharge" in lower):
            primary_doc = citations[0].doc_id if citations else "DOC-PLAT-02"
            return (
                "Following discharge, patients receive a personalized care recovery plan. You can submit daily "
                "check-ins recording your vital signs (blood pressure, temperature, pain level) directly through "
                f"the Follow-Up section [{primary_doc}]. Any abnormal readings trigger immediate physician alerts."
            )

        # 10. Platform Navigation
        if intent in [ChatIntent.INTENT_NAVIGATION, ChatIntent.INTENT_APP_NAVIGATION]:
            primary_doc = citations[0].doc_id if citations else "DOC-PLAT-01"
            return (
                f"Based on SwasthyaCare platform documentation [{primary_doc}], you can easily navigate "
                "our clinical services, doctor schedules, and digital health records through your authenticated dashboard."
            )

        # 11. Report & Statistical Risk Explanation
        if intent in [ChatIntent.INTENT_REPORT_EXPLANATION, ChatIntent.INTENT_ASSESSMENT_EXPLANATION]:
            return (
                "Your statistical risk assessment (such as the Framingham Cardiovascular or FINDRISC Diabetes models "
                "[DOC-PLAT-03]) provides a population-level estimate based on clinical indicators like blood pressure, "
                "BMI, and cholesterol. It is an educational risk estimate and not a medical diagnosis. Please consult "
                "your clinician to review your laboratory values and personalize your preventive care plan."
            )

        # 12. Medicine Information (Educational Pharmacology)
        if intent == ChatIntent.INTENT_MEDICINE_INFORMATION or re.search(r"\b(metformin|telmisartan|atorvastatin|aspirin|amlodipine|paracetamol)\b", lower):
            for drug in ["metformin", "telmisartan", "atorvastatin", "paracetamol"]:
                if drug in lower:
                    summary = EducationalPharmacologyEngine.get_educational_summary(drug)
                    if summary:
                        return summary
            return (
                "For verified pharmaceutical education, SwasthyaCare references Indian Pharmacopoeia and ICMR clinical "
                "guidelines. Always review active medications with your prescribing physician to prevent drug interactions "
                "and adverse effects."
            )

        # 13. Clinical Q&A (ICMR / WHO / NIMHANS / MoHFW)
        if intent == ChatIntent.INTENT_CLINICAL_QA:
            # Structured Symptom Clarification (SOCRATES clinical framework)
            mild_symptom = SymptomClarifier.detect_mild_symptom(lower)
            if mild_symptom and not any(k in lower for k in ["guideline", "icmr", "who", "normal", "target", "prevention"]):
                return SymptomClarifier.generate_socrates_clarification(mild_symptom, lower)

            if not citations:
                return NO_EVIDENCE_FALLBACK

            primary = citations[0]
            expanded = VernacularNormalizer.expand_query(lower)

            # Maternal & Child Health / Antenatal Care / Immunization (DOC-CLIN-07)
            if any(k in expanded for k in ["maternal", "pregnancy", "pregnant", "antenatal", "anc", "trimester", "breastfeed", "breastfeeding", "child", "infant", "vaccin", "immuniz", "teeka", "bachha", "garbh", "shishu"]):
                if any(v in expanded for v in ["vaccin", "immuniz", "teeka", "bcg", "polio", "pentavalent", "mr", "rotavirus"]):
                    return (
                        "Per MoHFW and WHO National Immunization Schedule guidelines [DOC-CLIN-07], infant vaccines "
                        "include BCG, Oral Polio (OPV), and Hepatitis B at birth; Pentavalent, Rotavirus, fIPV, and PCV at "
                        "6, 10, and 14 weeks; and Measles & Rubella (MR) with Vitamin A at 9–12 months. All childhood vaccines "
                        "are provided free of charge under India's Universal Immunization Programme (UIP)."
                    )
                if any(b in expanded for b in ["breastfeed", "feeding", "colostrum", "exclusive"]):
                    return (
                        "According to WHO and MoHFW Infant and Young Child Feeding (IYCF) guidelines [DOC-CLIN-07], breastfeeding "
                        "should be initiated within one hour of birth (colostrum must be given). Exclusive breastfeeding "
                        "is recommended for the first 6 months (180 days) without any pre-lacteal feeds or water. From 6 months onward, "
                        "introduce age-appropriate complementary foods while continuing breastfeeding up to 2 years or beyond."
                    )
                return (
                    "Per MoHFW & WHO Maternal Care Guidelines [DOC-CLIN-07], every pregnant woman should complete a minimum "
                    "of 4 antenatal care (ANC) visits: 1st in the first trimester, 2nd at 14–26 weeks, 3rd at 28–32 weeks, and 4th "
                    "at 36 weeks until term. Daily Iron & Folic Acid (IFA) tablets and Calcium supplementation (from 14 weeks) are recommended "
                    "for preventing anemia and pregnancy complications. Call 102 (JSSK) or 108 immediately if danger signs occur."
                )

            # Hypertension
            if "blood pressure" in expanded or "hypertension" in expanded or "sodium" in expanded or "salt" in expanded or "raktchap" in expanded:
                return (
                    "According to ICMR and Indian Guidelines on Hypertension (IGH-IV) [DOC-CLIN-02], normal blood pressure "
                    "for adults is below 120/80 mmHg. Lifestyle measures include restricting dietary sodium to under 2,000 mg/day "
                    "(approx. 1 flat teaspoon of salt), increasing potassium-rich fresh fruits and vegetables, maintaining regular "
                    "aerobic activity (150 minutes/week), and avoiding tobacco."
                )
            # Diabetes
            if "diabetes" in expanded or "sugar" in expanded or "glucose" in expanded or "hba1c" in expanded or "madhumeh" in expanded or "shakkar" in expanded:
                return (
                    "Per ICMR Type 2 Diabetes Management Guidelines [DOC-CLIN-01], normal fasting plasma glucose is below 100 mg/dL "
                    "and HbA1c is below 5.7%. Preventive management emphasizes a fiber-rich diet with complex carbohydrates (oats, "
                    "whole grains, pulses), restricting refined sugars, and engaging in at least 150 minutes of weekly moderate aerobic exercise."
                )
            # Cardiovascular / WHO
            if "heart" in expanded or "cardiovascular" in expanded or "cholesterol" in expanded:
                return (
                    "World Health Organization (WHO) HEARTS guidelines [DOC-CLIN-03] emphasize key modifiable cardiovascular factors: "
                    "smoking cessation, maintaining healthy blood pressure, managing lipid levels (reducing saturated fats and eliminating "
                    "trans-fats), and engaging in 150–300 minutes of moderate-intensity physical activity weekly."
                )
            # Mental health / Stress
            if "stress" in expanded or "mental" in expanded or "sleep" in expanded or "anxiety" in expanded or "tanav" in expanded or "chinta" in expanded:
                return (
                    "Non-pharmacological stress management based on NIMHANS and Tele-MANAS protocols [DOC-CLIN-05] includes daily "
                    "diaphragmatic breathing (4s inhale, 6s exhale), consistent sleep hygiene (7–9 hours), and regular exercise. "
                    "For free, confidential 24/7 mental wellness support, the Tele-MANAS helpline is available at 14416."
                )

            # -----------------------------------------------------------------
            # Dynamic Clinical Evidence Synthesis (Fallback for any other clinical query)
            # -----------------------------------------------------------------
            # If no hardcoded keyword above matched, we extract and format the
            # actual retrieved evidence from the knowledge base chunks rather than
            # returning a generic one-line placeholder.
            evidence_blocks = []
            for doc in citations:
                content = (getattr(doc, "text", "") or "").strip()
                if not content:
                    continue
                heading = getattr(doc, "section_title", "") or getattr(doc, "title", "Clinical Guidelines")
                evidence_blocks.append(
                    f"### {heading}\n"
                    f"{content}\n"
                    f"Source: {doc.source_organization} — {doc.title} [{doc.doc_id}]"
                )

            if evidence_blocks:
                return (
                    "Here is the relevant information from verified clinical guidelines available to SwasthyaCare:\n\n"
                    + "\n\n".join(evidence_blocks[:2])
                    + "\n\n"
                    "This information is for general education and does not replace an individual medical assessment."
                )

            # Resilient fallback if chunks contained no text
            return (
                f"Based on {primary.source_organization} guidelines ({primary.title}) [{primary.doc_id}]: "
                f"Key recommendations emphasize evidence-based lifestyle modifications, regular screening, "
                f"and consultation with a qualified medical practitioner."
            )

        return NO_EVIDENCE_FALLBACK

    async def generate_async(
        self,
        prompt: str,
        system_prompt: str,
        citations: List[Any],
        intent: ChatIntent,
        patient_context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> ProviderResult:
        start = time.time()
        raw_content = self.generate(prompt, system_prompt, citations, intent, patient_context)
        content = sanitize_clinical_formatting(raw_content)
        latency = int((time.time() - start) * 1000)
        return ProviderResult(
            content=content,
            provider="deterministic-mock",
            model="swasthya-clinical-engine-v1",
            prompt_tokens=len(prompt.split()),
            completion_tokens=len(content.split()),
            latency_ms=latency,
        )

    def _is_prescription_attempt(self, text: str) -> bool:
        patterns = [
            r"\b(prescribe|prescription|write\s+a\s+prescription)\b",
            r"\b(what\s+dose|dosage|how\s+many\s+mg|take\s+\d+\s*mg)\b",
            r"\b(can\s+i\s+give\s+\d+\s*mg|stop\s+taking\s+.*?\bmedicin(e|ation))\b",
            r"\b(stop|discontinue|alter|change|increase|decrease)\s+.*?\b(medicin|medication|drug|dose|dosage)\b",
            r"\b(dawa|dawai|goli|aushadhi)\s+(likh|bata|de\s+do|kitni\s+leni)\b",
            r"\b(konsi\s+dawa|kaunsi\s+dawai)\b",
        ]
        return any(re.search(p, text) for p in patterns)

    def _is_prompt_injection(self, text: str) -> bool:
        patterns = [
            r"\b(ignore\s+(all\s+)?previous\s+instructions|system\s+prompt|dan\s+mode)\b",
            r"\b(reveal\s+(your\s+)?initial\s+instructions|system\s+override)\b",
            r"\b(bypass\s+safety|jailbreak|disregard\s+rules)\b",
        ]
        return any(re.search(p, text) for p in patterns)


def _ensure_env_loaded():
    """Load key-value pairs from ai-service/.env into os.environ if not already present."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    env_file = os.path.join(base_dir, ".env")
    if os.path.isfile(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip().strip("'\"")
                        if k not in os.environ:
                            os.environ[k] = v
        except Exception as e:
            logger.warning(f"Failed to read .env file: {e}")


class AnthropicClaudeProvider(BaseLLMProvider):
    """
    Anthropic Claude Provider supporting Claude models and OmniRoute proxy.
    Configurable via ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL, and ANTHROPIC_MODEL.
    Includes automated fallback to DeterministicMockProvider on connection or rate limits.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        _ensure_env_loaded()
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model = model or os.getenv("ANTHROPIC_MODEL", "Coding-Primary")
        self.base_url = base_url or os.getenv("ANTHROPIC_BASE_URL")
        self.mock_fallback = DeterministicMockProvider()
        self.client = None

        if self.api_key:
            try:
                import anthropic
                kwargs = {"api_key": self.api_key}
                if self.base_url:
                    kwargs["base_url"] = self.base_url
                self.client = anthropic.AsyncAnthropic(**kwargs)
            except Exception as e:
                logger.warning(f"Could not initialize Anthropic client: {e}")

    async def generate_async(
        self,
        prompt: str,
        system_prompt: str,
        citations: List[Any],
        intent: ChatIntent,
        patient_context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> ProviderResult:
        # Fall back to mock if no API key or client is unavailable
        if not self.client or not self.api_key:
            logger.info("Anthropic API key unconfigured; using DeterministicMockProvider fallback.")
            res = await self.mock_fallback.generate_async(
                prompt, system_prompt, citations, intent, patient_context, conversation_history
            )
            res.provider = "anthropic (mock fallback)"
            return res

        # Immediate deterministic escalation for P0 emergencies
        if intent == ChatIntent.INTENT_EMERGENCY:
            return await self.mock_fallback.generate_async(
                prompt, system_prompt, citations, intent, patient_context, conversation_history
            )

        # Immediate deterministic refusal for prescription or prompt injection attempts
        lower = prompt.lower()
        if self.mock_fallback._is_prescription_attempt(lower) or self.mock_fallback._is_prompt_injection(lower):
            return await self.mock_fallback.generate_async(
                prompt, system_prompt, citations, intent, patient_context, conversation_history
            )

        start_time = time.time()
        try:
            # Prepare context-enriched messages
            citations_text = "\n\n".join(
                [f"[{c.doc_id}] ({c.source_organization} - {c.title}):\n{c.text[:400]}" for c in citations]
            )

            full_system = f"{CLINICAL_SYSTEM_PROMPT}\n\nVERIFIED GUIDELINES:\n{citations_text}"
            if patient_context:
                full_system += f"\n\nPATIENT PROFILE: Age {patient_context.get('patientAge', 'N/A')}, Gender {patient_context.get('patientGender', 'N/A')}"

            messages = []
            if conversation_history:
                for turn in conversation_history[-6:]:
                    messages.append({"role": turn.get("role", "user"), "content": turn.get("content", "")})
            messages.append({"role": "user", "content": prompt})

            response = await self.client.messages.create(
                model=self.model,
                max_tokens=1000,
                system=full_system,
                messages=messages,
            )

            latency = int((time.time() - start_time) * 1000)
            raw_content = response.content[0].text if response.content else ""
            content = sanitize_clinical_formatting(raw_content)
            prompt_toks = getattr(response.usage, "input_tokens", 0)
            comp_toks = getattr(response.usage, "output_tokens", 0)

            return ProviderResult(
                content=content,
                provider="anthropic",
                model=self.model,
                prompt_tokens=prompt_toks,
                completion_tokens=comp_toks,
                latency_ms=latency,
            )
        except Exception as e:
            logger.error(f"Anthropic API call failed ({e}); falling back to deterministic engine.")
            res = await self.mock_fallback.generate_async(
                prompt, system_prompt, citations, intent, patient_context, conversation_history
            )
            res.provider = "anthropic (resilient fallback)"
            return res


class OpenAIProvider(BaseLLMProvider):
    """
    OpenAI Provider supporting GPT-4o / GPT-4.5.
    Configurable via OPENAI_API_KEY and OPENAI_MODEL.
    Includes automated fallback to DeterministicMockProvider.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o")
        self.mock_fallback = DeterministicMockProvider()

    async def generate_async(
        self,
        prompt: str,
        system_prompt: str,
        citations: List[Any],
        intent: ChatIntent,
        patient_context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> ProviderResult:
        if not self.api_key:
            logger.info("OpenAI API key unconfigured; using DeterministicMockProvider fallback.")
            res = await self.mock_fallback.generate_async(
                prompt, system_prompt, citations, intent, patient_context, conversation_history
            )
            res.provider = "openai (mock fallback)"
            return res

        # Immediate deterministic escalation for P0 emergencies
        if intent == ChatIntent.INTENT_EMERGENCY:
            return await self.mock_fallback.generate_async(
                prompt, system_prompt, citations, intent, patient_context, conversation_history
            )

        # Immediate deterministic refusal for prescription or prompt injection attempts
        lower = prompt.lower()
        if self.mock_fallback._is_prescription_attempt(lower) or self.mock_fallback._is_prompt_injection(lower):
            return await self.mock_fallback.generate_async(
                prompt, system_prompt, citations, intent, patient_context, conversation_history
            )

        start_time = time.time()
        try:
            import httpx
            citations_text = "\n\n".join(
                [f"[{c.doc_id}] ({c.source_organization} - {c.title}):\n{c.text[:400]}" for c in citations]
            )
            full_system = f"{CLINICAL_SYSTEM_PROMPT}\n\nVERIFIED GUIDELINES:\n{citations_text}"

            messages = [{"role": "system", "content": full_system}]
            if conversation_history:
                for turn in conversation_history[-6:]:
                    messages.append({"role": turn.get("role", "user"), "content": turn.get("content", "")})
            messages.append({"role": "user", "content": prompt})

            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "max_tokens": 1000,
                        "temperature": 0.2,
                    },
                )
                resp.raise_for_status()
                data = resp.json()

            latency = int((time.time() - start_time) * 1000)
            raw_content = data["choices"][0]["message"]["content"]
            content = sanitize_clinical_formatting(raw_content)
            prompt_toks = data.get("usage", {}).get("prompt_tokens", 0)
            comp_toks = data.get("usage", {}).get("completion_tokens", 0)

            return ProviderResult(
                content=content,
                provider="openai",
                model=self.model,
                prompt_tokens=prompt_toks,
                completion_tokens=comp_toks,
                latency_ms=latency,
            )
        except Exception as e:
            logger.error(f"OpenAI API call failed ({e}); falling back to deterministic engine.")
            res = await self.mock_fallback.generate_async(
                prompt, system_prompt, citations, intent, patient_context, conversation_history
            )
            res.provider = "openai (resilient fallback)"
            return res


class ProviderFactory:
    """Factory to instantiate and retrieve configured LLM providers."""

    @staticmethod
    def get_provider(provider_type: Optional[str] = None) -> BaseLLMProvider:
        _ensure_env_loaded()
        selected = (provider_type or os.getenv("LLM_PROVIDER", "deterministic-mock")).strip().lower()

        if selected in ["anthropic", "claude", "omniroute"]:
            return AnthropicClaudeProvider()
        elif selected in ["openai", "gpt"]:
            return OpenAIProvider()
        else:
            return DeterministicMockProvider()
