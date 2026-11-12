"""
SwasthyaCare AI Service — Dual RAG Engine & Conversational Orchestrator
Sprint 10: Tasks S10-01 to S10-06
Provides dual-domain document retrieval (Platform vs Clinical), intent routing,
Priority 0 emergency red-flag triage, anti-prompt injection, and pluggable provider adapters.
"""

import os
import re
import time
import math
from typing import List, Dict, Any, Optional, Tuple
from abc import ABC, abstractmethod

from app.schemas.chat_assistant import (
    ChatOrchestrationRequest,
    ChatOrchestrationResponse,
    ChatIntent,
    ActionType,
    ActionProposal,
    CitationItem,
    CLINICAL_CHAT_DISCLAIMER,
    PRESCRIPTION_REFUSAL_TEXT,
)

# Emergency Escalation Response Template (Sprint 9 & 10 Clinical Safety Protocol)
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


class DocumentChunk:
    def __init__(
        self,
        doc_id: str,
        title: str,
        source_organization: str,
        category: str,
        chunk_id: str,
        text: str,
        section_title: str = "",
    ):
        self.doc_id = doc_id
        self.title = title
        self.source_organization = source_organization
        self.category = category
        self.chunk_id = chunk_id
        self.text = text
        self.section_title = section_title
        self.tokens = self._tokenize(f"{title} {section_title} {text}")

    @staticmethod
    def _tokenize(text: str) -> set:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        words = [w for w in cleaned.split() if len(w) > 2]
        return set(words)


class DualCorpusManager:
    """
    Manages two physically separated document corpora:
    1. Platform Corpus (SwasthyaCare app mechanics, booking rules, OPD queue)
    2. Healthcare Clinical Corpus (ICMR, WHO, NIMHANS guidelines)
    """

    def __init__(self, base_data_dir: str):
        self.base_dir = base_data_dir
        self.platform_docs_dir = os.path.join(base_data_dir, "knowledge_base", "app_docs")
        self.clinical_docs_dir = os.path.join(base_data_dir, "knowledge_base", "clinical_guidelines")
        self.platform_chunks: List[DocumentChunk] = []
        self.clinical_chunks: List[DocumentChunk] = []
        self._load_and_index_corpora()

    def _parse_markdown_file(self, file_path: str, category: str) -> List[DocumentChunk]:
        chunks = []
        if not os.path.exists(file_path):
            return chunks

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract frontmatter if present
        metadata = {
            "id": os.path.basename(file_path).replace(".md", ""),
            "title": os.path.basename(file_path),
            "source_organization": "SwasthyaCare" if category == "platform" else "Clinical Guidelines",
            "category": category,
        }

        body = content
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter_text = parts[1]
                body = parts[2]
                for line in frontmatter_text.strip().split("\n"):
                    if ":" in line:
                        k, v = line.split(":", 1)
                        metadata[k.strip()] = v.strip()

        # Split body into sections by markdown headers (## or #)
        sections = re.split(r"\n(?=#{1,3}\s+)", body)
        for idx, sec in enumerate(sections):
            text = sec.strip()
            if not text:
                continue

            header_match = re.match(r"^#{1,3}\s+(.+)$", text, re.MULTILINE)
            section_title = header_match.group(1).strip() if header_match else f"Section {idx+1}"

            chunk = DocumentChunk(
                doc_id=metadata.get("id", "DOC-UNKNOWN"),
                title=metadata.get("title", "Document"),
                source_organization=metadata.get("source_organization", "Unknown"),
                category=category,
                chunk_id=f"{metadata.get('id', 'DOC')}-C{idx+1:02d}",
                text=text,
                section_title=section_title,
            )
            chunks.append(chunk)

        return chunks

    def _load_and_index_corpora(self):
        # Index Platform Docs
        if os.path.exists(self.platform_docs_dir):
            for fname in os.listdir(self.platform_docs_dir):
                if fname.endswith(".md"):
                    fpath = os.path.join(self.platform_docs_dir, fname)
                    self.platform_chunks.extend(self._parse_markdown_file(fpath, "platform"))

        # Index Clinical Docs
        if os.path.exists(self.clinical_docs_dir):
            for fname in os.listdir(self.clinical_docs_dir):
                if fname.endswith(".md"):
                    fpath = os.path.join(self.clinical_docs_dir, fname)
                    self.clinical_chunks.extend(self._parse_markdown_file(fpath, "clinical"))

    def _score_chunk(self, query_tokens: set, chunk: DocumentChunk) -> float:
        if not query_tokens or not chunk.tokens:
            return 0.0

        overlap = query_tokens.intersection(chunk.tokens)
        if not overlap:
            return 0.0

        # Term overlap ratio + title/section boosting
        base_score = len(overlap) / (math.sqrt(len(query_tokens)) * math.sqrt(len(chunk.tokens)))

        # Header boosting
        section_tokens = DocumentChunk._tokenize(chunk.section_title + " " + chunk.title)
        header_overlap = query_tokens.intersection(section_tokens)
        if header_overlap:
            base_score += len(header_overlap) * 0.25

        # Domain specific exact keyword boost
        high_value_keywords = {
            "glucose", "diabetes", "hba1c", "glycemia", "fasting",
            "hypertension", "sodium", "salt", "systolic", "diastolic",
            "cardiovascular", "cholesterol", "token", "queue", "appointment"
        }
        key_overlap = query_tokens.intersection(chunk.tokens).intersection(high_value_keywords)
        if key_overlap:
            base_score += len(key_overlap) * 0.35

        return min(base_score, 1.0)

    def search_platform(self, query: str, top_k: int = 2, threshold: float = 0.10) -> List[Tuple[DocumentChunk, float]]:
        q_tokens = DocumentChunk._tokenize(query)
        scored = []
        for chk in self.platform_chunks:
            s = self._score_chunk(q_tokens, chk)
            if s >= threshold:
                scored.append((chk, s))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def search_clinical(self, query: str, top_k: int = 2, threshold: float = 0.10) -> List[Tuple[DocumentChunk, float]]:
        q_tokens = DocumentChunk._tokenize(query)
        scored = []
        for chk in self.clinical_chunks:
            s = self._score_chunk(q_tokens, chk)
            if s >= threshold:
                scored.append((chk, s))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]


class IntentClassifier:
    """
    Evaluates incoming queries to determine primary intent, emergency red flags,
    and prompt injection attempts.
    """

    # Priority 0 Red Flag Patterns (Heart Attack, Stroke, Anaphylaxis, Suicide, Trauma)
    RED_FLAG_PATTERNS = [
        r"\b(chest\s+pain|chest\s+pressure|pain\s+radiat(ing|es)|heart\s+attack|crushing\s+chest)\b",
        r"\b(droop(ing|ed)?\s+face|slurr(ed|ing)\s+speech|stroke|facial\s+droop|arm\s+weakness)\b",
        r"\b(can'?t|cannot|unable\s+to|hard\s+to)\s+breathe\b",
        r"\b(gasping|shortness\s+of\s+breath|blue\s+lips|cyanosis|choking|airway\s+closing)\b",
        r"\b(suicid(e|al)|kill\s+myself|end\s+my\s+life|want\s+to\s+die|self\s*harm)\b",
        r"\b(anaphyla(xis|ctic))\b",
        r"\b(throat|lips?|tongue)\s+(is\s+)?(swell(ing|ed|t)?|closing)\b",
        r"\b(uncontrolled\s+bleed(ing)?|arterial\s+bleed|head\s+injury\s+unconscious)\b",
    ]

    # Prescription / Dosage Patterns
    PRESCRIPTION_PATTERNS = [
        r"\b(prescribe|prescription|write\s+a\s+prescription)\b",
        r"\b(what\s+dose|dosage|how\s+many\s+mg|take\s+\d+\s*mg)\b",
        r"\b(can\s+i\s+give\s+\d+\s*mg|stop\s+taking\s+my\s+medicin(e|ation))\b",
    ]

    # Jailbreak & Prompt Injection Patterns
    INJECTION_PATTERNS = [
        r"\b(ignore\s+(all\s+)?previous\s+instructions|system\s+prompt|dan\s+mode)\b",
        r"\b(reveal\s+(your\s+)?initial\s+instructions|system\s+override)\b",
        r"\b(bypass\s+safety|jailbreak|disregard\s+rules)\b",
    ]

    # App Actions
    ACTION_PATTERNS = [
        r"\b(book|schedule|make)\s+(an\s+)?appointment\b",
        r"\b(cancel|reschedule)\s+(my\s+)?appointment\b",
    ]

    # App Navigation
    NAVIGATION_PATTERNS = [
        r"\b(opd|token|queue|wait\s+time|how\s+to\s+book|find\s+doctor|doctor\s+list)\b",
        r"\b(follow\s*up|recovery\s+update|discharge\s+plan)\b",
        r"\b(risk\s+assessment|risk\s+model|framingham|findrisc|cardiac\s+score|diabetes\s+score)\b",
    ]

    # Greetings & Chitchat
    CHITCHAT_PATTERNS = [
        r"^(hi|hello|hey|good\s+morning|good\s+evening|namaste|greetings)[\.!]?$",
        r"^(thanks|thank\s+you|ok|bye|goodbye|see\s+you)[\.!]?$",
        r"\b(who\s+are\s+you|what\s+can\s+you\s+do|write\s+a\s+poem|tell\s+a\s+joke)\b",
        r"\b(capital\s+of|weather|score|football|cricket)\b",
    ]

    @classmethod
    def detect_emergency(cls, message: str) -> bool:
        lower = message.lower()
        for pat in cls.RED_FLAG_PATTERNS:
            if re.search(pat, lower):
                return True
        return False

    @classmethod
    def detect_prescription_request(cls, message: str) -> bool:
        lower = message.lower()
        for pat in cls.PRESCRIPTION_PATTERNS:
            if re.search(pat, lower):
                return True
        return False

    @classmethod
    def detect_prompt_injection(cls, message: str) -> bool:
        lower = message.lower()
        for pat in cls.INJECTION_PATTERNS:
            if re.search(pat, lower):
                return True
        return False

    @classmethod
    def classify_intent(cls, message: str) -> ChatIntent:
        lower = message.lower()

        # P0: Emergency Check
        if cls.detect_emergency(lower):
            return ChatIntent.INTENT_EMERGENCY

        # Injection -> Deflect as Chitchat
        if cls.detect_prompt_injection(lower):
            return ChatIntent.INTENT_GENERAL_CHITCHAT

        # P1: App Actions
        for pat in cls.ACTION_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_APP_ACTION

        # P1: App Navigation
        for pat in cls.NAVIGATION_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_APP_NAVIGATION

        # P1: Report explanation
        if re.search(r"\b(my\s+risk|my\s+score|my\s+report|percentage\s+risk)\b", lower):
            return ChatIntent.INTENT_REPORT_EXPLANATION

        # P3: Greetings / Chitchat
        for pat in cls.CHITCHAT_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_GENERAL_CHITCHAT

        # Default to Clinical QA
        return ChatIntent.INTENT_CLINICAL_QA


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_prompt: str,
        citations: List[DocumentChunk],
        intent: ChatIntent,
        patient_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        pass


class DeterministicMockProvider(BaseLLMProvider):
    """
    Deterministic rule-based and citation-grounded response provider.
    Runs 100% offline with zero dependencies or external API costs.
    """

    def generate(
        self,
        prompt: str,
        system_prompt: str,
        citations: List[DocumentChunk],
        intent: ChatIntent,
        patient_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        lower = prompt.lower()

        # Emergency
        if intent == ChatIntent.INTENT_EMERGENCY:
            return EMERGENCY_ESCALATION_TEMPLATE

        # Prescription refusal
        if IntentClassifier.detect_prescription_request(lower):
            return (
                f"{PRESCRIPTION_REFUSAL_TEXT}\n\n"
                "If you are experiencing acute discomfort, please visit the hospital or book a consultation "
                "with our specialists."
            )

        # Prompt injection deflection
        if IntentClassifier.detect_prompt_injection(lower):
            return (
                "I am SwasthyaCare Assistant, a secure clinical and hospital navigation companion. "
                "I focus exclusively on providing verified health guidelines and assisting with SwasthyaCare workflows. "
                "How may I assist your healthcare needs today?"
            )

        # Chitchat
        if intent == ChatIntent.INTENT_GENERAL_CHITCHAT:
            if re.search(r"^(hi|hello|hey|namaste)", lower):
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

        # App Actions (Appointment booking / cancellation)
        if intent == ChatIntent.INTENT_APP_ACTION:
            if "cancel" in lower:
                return (
                    "I can assist you with cancelling your appointment. According to our hospital policy "
                    "[DOC-PLAT-01], appointments can be cancelled up to 24 hours prior to the scheduled slot. "
                    "Please confirm below to proceed with the cancellation."
                )
            return (
                "I can help you prepare an appointment booking request. Our specialists are available across "
                "Cardiology, Diabetology, and General Medicine [DOC-PLAT-01]. Please review and confirm the proposed "
                "appointment details below to submit your request."
            )

        # App Navigation
        if intent == ChatIntent.INTENT_APP_NAVIGATION:
            if not citations:
                return NO_EVIDENCE_FALLBACK

            primary_doc = citations[0]
            if "queue" in lower or "opd" in lower or "token" in lower:
                return (
                    "In SwasthyaCare, once you arrive at the clinic, our reception issues you a dynamic digital token. "
                    "You can track real-time queue progress and estimated consultation wait times directly on your live "
                    f"dashboard [{primary_doc.doc_id}]. Automated notifications alert you when your turn approaches."
                )
            if "follow" in lower or "recovery" in lower or "discharge" in lower:
                return (
                    "Following discharge, patients receive a personalized care recovery plan. You can submit daily "
                    "check-ins recording your vital signs (blood pressure, temperature, pain level) directly through "
                    f"the Follow-Up section [{primary_doc.doc_id}]. Any abnormal readings trigger immediate physician alerts."
                )
            return (
                f"Based on SwasthyaCare platform documentation [{primary_doc.doc_id}], you can easily navigate "
                f"our clinical services, doctor schedules, and digital health records through your authenticated dashboard."
            )

        # Report Explanation
        if intent == ChatIntent.INTENT_REPORT_EXPLANATION:
            return (
                "Your statistical risk assessment (such as the Framingham Cardiovascular or FINDRISC Diabetes models "
                "[DOC-PLAT-03]) provides a population-level estimate based on clinical indicators like blood pressure, "
                "BMI, and cholesterol. It is an educational risk estimate and not a medical diagnosis. Please consult "
                "your clinician to review your laboratory values and personalize your preventive care plan."
            )

        # Clinical QA
        if intent == ChatIntent.INTENT_CLINICAL_QA:
            if not citations:
                return NO_EVIDENCE_FALLBACK

            primary = citations[0]
            # Hypertension
            if "blood pressure" in lower or "hypertension" in lower or "sodium" in lower or "salt" in lower:
                return (
                    "According to ICMR and Indian Guidelines on Hypertension (IGH-IV) [DOC-CLIN-02], normal blood pressure "
                    "for adults is below 120/80 mmHg. Lifestyle measures include restricting dietary sodium to under 2,000 mg/day "
                    "(approx. 1 flat teaspoon of salt), increasing potassium-rich fresh fruits and vegetables, maintaining regular "
                    "aerobic activity (150 minutes/week), and avoiding tobacco."
                )
            # Diabetes
            if "diabetes" in lower or "sugar" in lower or "glucose" in lower or "hba1c" in lower:
                return (
                    "Per ICMR Type 2 Diabetes Management Guidelines [DOC-CLIN-01], normal fasting plasma glucose is below 100 mg/dL "
                    "and HbA1c is below 5.7%. Preventive management emphasizes a fiber-rich diet with complex carbohydrates (oats, "
                    "whole grains, pulses), restricting refined sugars, and engaging in at least 150 minutes of weekly moderate aerobic exercise."
                )
            # Cardiovascular / WHO
            if "heart" in lower or "cardiovascular" in lower or "cholesterol" in lower:
                return (
                    "World Health Organization (WHO) HEARTS guidelines [DOC-CLIN-03] emphasize key modifiable cardiovascular factors: "
                    "smoking cessation, maintaining healthy blood pressure, managing lipid levels (reducing saturated fats and eliminating "
                    "trans-fats), and engaging in 150–300 minutes of moderate-intensity physical activity weekly."
                )
            # Mental health / Stress
            if "stress" in lower or "mental" in lower or "sleep" in lower or "anxiety" in lower:
                return (
                    "Non-pharmacological stress management based on NIMHANS and Tele-MANAS protocols [DOC-CLIN-05] includes daily "
                    "diaphragmatic breathing (4s inhale, 6s exhale), consistent sleep hygiene (7–9 hours), and regular exercise. "
                    "For free, confidential 24/7 mental wellness support, the Tele-MANAS helpline is available at 14416."
                )

            # Generic clinical synthesis using retrieved snippet
            return (
                f"Based on {primary.source_organization} guidelines ({primary.title}) [{primary.doc_id}]: "
                f"Key recommendations emphasize evidence-based lifestyle modifications, regular screening, "
                f"and consultation with a qualified medical practitioner."
            )

        return NO_EVIDENCE_FALLBACK


class ChatRAGService:
    """
    Main Service orchestrating:
    1. Input sanitization & red-flag check
    2. Intent classification
    3. Dual-Corpus search (Platform vs Clinical)
    4. Response generation via pluggable provider
    5. Action proposal generation
    """

    def __init__(self, base_data_dir: Optional[str] = None):
        if not base_data_dir:
            base_data_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                "data",
            )
        self.corpus_manager = DualCorpusManager(base_data_dir)
        self.provider = DeterministicMockProvider()

    def _extract_action_proposal(self, message: str, intent: ChatIntent) -> Optional[ActionProposal]:
        if intent != ChatIntent.INTENT_APP_ACTION:
            return None

        lower = message.lower()
        if "cancel" in lower:
            return ActionProposal(
                action_type=ActionType.CANCEL_APPOINTMENT,
                target_resource="appointment",
                parameters={"action": "CANCEL_APPOINTMENT"},
                requires_confirmation=True,
                preview_summary="Cancel upcoming appointment request",
            )

        # Detect doctor or specialty if present
        doctor_name = "Dr. Sharma"
        if "dr." in lower or "doctor" in lower:
            doc_match = re.search(r"\b(dr\.?\s+[a-z]+)\b", lower)
            if doc_match:
                doctor_name = doc_match.group(1).title()

        return ActionProposal(
            action_type=ActionType.BOOK_APPOINTMENT,
            target_resource="appointment",
            parameters={
                "doctor_name": doctor_name,
                "specialization": "General Medicine / Cardiology",
                "preferred_time": "Morning (10:00 AM - 12:00 PM)",
            },
            requires_confirmation=True,
            preview_summary=f"Request appointment with {doctor_name}",
        )

    async def orchestrate(self, request: ChatOrchestrationRequest) -> ChatOrchestrationResponse:
        start_time = time.time()
        user_msg = request.message.strip()

        # Step 1: Detect intent
        intent = IntentClassifier.classify_intent(user_msg)
        is_emergency = intent == ChatIntent.INTENT_EMERGENCY

        # Step 2: Retrieve from appropriate domain
        citations: List[DocumentChunk] = []
        if not is_emergency:
            if intent in [ChatIntent.INTENT_APP_NAVIGATION, ChatIntent.INTENT_APP_ACTION, ChatIntent.INTENT_REPORT_EXPLANATION]:
                results = self.corpus_manager.search_platform(user_msg, top_k=2)
                citations = [r[0] for r in results]
            elif intent == ChatIntent.INTENT_CLINICAL_QA:
                results = self.corpus_manager.search_clinical(user_msg, top_k=2)
                citations = [r[0] for r in results]

        # Step 3: Generate response via provider
        response_text = self.provider.generate(
            prompt=user_msg,
            system_prompt="",
            citations=citations,
            intent=intent,
            patient_context=request.patient_context,
        )

        # Step 4: Assemble citations metadata
        citation_items = [
            CitationItem(
                doc_id=c.doc_id,
                title=c.title,
                source_organization=c.source_organization,
                snippet=c.text[:200] + ("..." if len(c.text) > 200 else ""),
            )
            for c in citations
        ]

        # Step 5: Assemble action proposal
        action_proposal = self._extract_action_proposal(user_msg, intent)

        elapsed_ms = int((time.time() - start_time) * 1000)

        return ChatOrchestrationResponse(
            intent=intent,
            is_emergency=is_emergency,
            response_text=response_text,
            citations=citation_items,
            action_proposal=action_proposal,
            latency_ms=elapsed_ms,
            provider="deterministic-mock",
        )


# Global singleton instance for FastAPI runtime
chat_rag_service = ChatRAGService()
