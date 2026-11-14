"""
============================================================================
SWASTHYACARE AI SERVICE — DUAL RAG ENGINE & CONVERSATIONAL ORCHESTRATOR
============================================================================
Location: ai-service/app/services/chat_rag_service.py

HOW THIS PYTHON AI SERVICE WORKS:
1. Dual-Corpus Knowledge Base:
   - Platform Corpus (app_docs/): Hospital booking rules, digital token queue, OPD triage.
   - Clinical Corpus (clinical_guidelines/): ICMR (Diabetes, Hypertension), WHO, NIMHANS, MoHFW.
2. Hybrid Retrieval Engine (BM25 + Dense Semantic Vectors + Vernacular Normalization):
   - BM25 Lexical Keyword Search: Okapi BM25 scoring for exact medical keyword matches.
   - Dense Semantic Vector Search: TF-IDF + TruncatedSVD Latent Semantic Analysis (LSA).
   - Vernacular Normalizer: Translates Hindi/Hinglish terms (e.g. "chhati me dard", "shakkar",
     "teeka", "bachha") into clinical concepts for accurate search and triage.
3. Clinical Safety Guardrails:
   - Priority 0 Emergency Triage: Intercepts cardiac, stroke, respiratory, or suicidal emergencies.
   - NegEx Negation Detection: Evaluates context windows so "I do NOT have chest pain" does
     NOT trigger an emergency false-positive lockout.
   - Anti-Prescription Defense: Rejects illegal drug prescription requests.
4. Orchestration Pipeline (`ChatRAGService.orchestrate`):
   Step 1: Classify user intent & detect emergency / red-flags.
   Step 2: Search appropriate knowledge-base corpus (Platform vs Clinical) via hybrid retrieval.
   Step 3: Call configured LLM provider (Claude Sonnet 5.5, GPT-4o, or Offline Mock).
   Step 4: Package citations with exact doc IDs [DOC-CLIN-01, DOC-PLAT-01].
   Step 5: Generate two-step action proposals if appointment booking/cancellation was requested.
============================================================================
"""

import os
import re
import time
import math
import logging
from typing import List, Dict, Any, Optional, Tuple
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

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

from app.services.llm_providers import (
    BaseLLMProvider,
    DeterministicMockProvider,
    AnthropicClaudeProvider,
    OpenAIProvider,
    ProviderFactory,
    ProviderResult,
    CLINICAL_SYSTEM_PROMPT,
    EMERGENCY_ESCALATION_TEMPLATE,
    NO_EVIDENCE_FALLBACK,
)
from app.services.hybrid_retrieval import (
    HybridCorpusIndex,
    VernacularNormalizer,
)
from app.services.clinical_guardrails import (
    ClinicalNegationDetector,
    EducationalPharmacologyEngine,
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
        self.platform_index = HybridCorpusIndex(alpha=0.55)
        self.clinical_index = HybridCorpusIndex(alpha=0.50)
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

        # Build Hybrid Indexes (BM25 Lexical + Dense Semantic Vectors)
        self.platform_index.build_index(self.platform_chunks)
        self.clinical_index.build_index(self.clinical_chunks)

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
        # Primary: Hybrid retrieval (BM25 + Semantic Vectors + Vernacular Normalization)
        results = self.platform_index.search(query, top_k=top_k, threshold=threshold)
        if results:
            return results

        # Resilient fallback: lexical overlap
        q_tokens = DocumentChunk._tokenize(VernacularNormalizer.expand_query(query))
        scored = []
        for chk in self.platform_chunks:
            s = self._score_chunk(q_tokens, chk)
            if s >= threshold:
                scored.append((chk, s))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def search_clinical(self, query: str, top_k: int = 2, threshold: float = 0.10) -> List[Tuple[DocumentChunk, float]]:
        # Primary: Hybrid retrieval (BM25 + Semantic Vectors + Vernacular Normalization)
        results = self.clinical_index.search(query, top_k=top_k, threshold=threshold)
        if results:
            return results

        # Resilient fallback: lexical overlap
        q_tokens = DocumentChunk._tokenize(VernacularNormalizer.expand_query(query))
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
        # Vernacular / Hinglish Red Flags
        r"\b(chhati|seene?)\b.*?\b(dard|takleef|jalan|peeda|dabav)\b",
        r"\b(saans|saas)\b.*?\b(takleef|dikkat|ruk|fool|rukna)\b",
        r"\b(jaan\s+dena|mar\s+jaana|khudkushi|aatmhatya)\b",
        r"\b(khoon\s+behna|khoon\s+ki\s+ulti|raktasrav)\b",
    ]

    # Prescription / Dosage Patterns
    PRESCRIPTION_PATTERNS = [
        r"\b(prescribe|prescription|write\s+a\s+prescription)\b",
        r"\b(what\s+dose|dosage|how\s+many\s+mg|take\s+\d+\s*mg)\b",
        r"\b(can\s+i\s+give\s+\d+\s*mg|stop\s+taking\s+.*?\bmedicin(e|ation))\b",
        r"\b(stop|discontinue|alter|change|increase|decrease)\s+.*?\b(medicin|medication|drug|dose|dosage)\b",
        r"\b(dawa|dawai|goli|aushadhi)\s+(likh|bata|de\s+do|kitni\s+leni)\b",
        r"\b(konsi\s+dawa|kaunsi\s+dawai)\b",
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

    # Appointment Guidance & Pricing
    APPOINTMENT_HELP_PATTERNS = [
        r"\b(how\s+to\s+book|booking\s+fee|consultation\s+fee|opd\s+charges)\b",
        r"\b(doctor\s+schedule|visiting\s+hours|available\s+slots|doctor\s+profiles?)\b",
    ]

    # Queue & OPD Mechanics
    QUEUE_PATTERNS = [
        r"\b(opd|token|queue|wait\s+time|token\s+number|digital\s+token)\b",
    ]

    # Follow-Up & Recovery
    FOLLOWUP_PATTERNS = [
        r"\b(follow\s*up|recovery|discharge|post-discharge|vital\s*signs?|check-?ins?)\b",
    ]

    # General Hospital Navigation
    NAVIGATION_PATTERNS = [
        r"\b(find\s+doctor|doctor\s+list|department|hospital\s+map|lab\s+location)\b",
        r"\b(risk\s+assessment|risk\s+model|framingham|findrisc|cardiac\s+score|diabetes\s+score)\b",
    ]

    # Human Support Escalation
    HUMAN_SUPPORT_PATTERNS = [
        r"\b(talk\s+to|speak\s+with|connect\s+(me\s+)?to)\s+(a\s+)?(human|agent|operator|receptionist|nurse|desk)\b",
        r"\b(customer\s+support|helpdesk|contact\s+support|real\s+person)\b",
    ]

    # Medicine / Pharmacology
    MEDICINE_PATTERNS = [
        r"\b(metformin|telmisartan|atorvastatin|aspirin|amlodipine|paracetamol|insulin)\b",
        r"\b(antibiotic|blood\s+thinner|painkiller|side\s+effects?)\b",
    ]

    # Report & Risk Model Explanation
    REPORT_PATTERNS = [
        r"\b(my\s+.*(risk|score|report)|risk\s+score|risk\s+report|risk\s+model|framingham|findrisc)\b",
        r"\b(percentage\s+risk|explain\s+.*(risk|score|report))\b",
    ]

    # Greetings & Chitchat
    CHITCHAT_PATTERNS = [
        r"\b(hi|hello|hey|good\s+(morning|afternoon|evening|day)|namaste|greetings)\b",
        r"\b(thanks|thank\s+you|ok|bye|goodbye|see\s+you)\b",
        r"\b(who\s+are\s+you|what\s+can\s+you\s+do|write\s+a\s+poem|tell\s+a\s+joke)\b",
        r"\b(capital\s+of|weather|(sports?|match|game|cricket|football)\s+score|football|cricket)\b",
    ]

    @classmethod
    def detect_emergency(cls, message: str) -> bool:
        lower = message.lower()
        # 1. Evaluate raw message with negation awareness
        is_em, _ = ClinicalNegationDetector.evaluate_emergency_with_negation(
            lower, cls.RED_FLAG_PATTERNS
        )
        if is_em:
            return True

        # 2. Evaluate vernacular expansion only if raw message was not explicitly negated
        expanded = VernacularNormalizer.expand_query(lower)
        if expanded != lower:
            is_em_exp, _ = ClinicalNegationDetector.evaluate_emergency_with_negation(
                expanded, cls.RED_FLAG_PATTERNS
            )
            # Ensure the raw query does not contain negation around vernacular terms
            has_raw_negation = any(
                re.search(neg, lower)
                for neg in [r"\bnahi\b", r"\bno\b", r"\bnot\b", r"\bkoi\s+nahi\b", r"\bbina\b"]
            )
            if is_em_exp and not has_raw_negation:
                return True

        return False

    @classmethod
    def detect_prescription_request(cls, message: str) -> bool:
        lower = message.lower()
        expanded = VernacularNormalizer.expand_query(lower)
        for pat in cls.PRESCRIPTION_PATTERNS:
            if re.search(pat, lower) or re.search(pat, expanded):
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
        lower = message.lower().strip()

        # P0: Emergency Check
        if cls.detect_emergency(lower):
            return ChatIntent.INTENT_EMERGENCY

        # Injection -> Deflect as Chitchat
        if cls.detect_prompt_injection(lower):
            return ChatIntent.INTENT_GENERAL_CHITCHAT

        # P1: Human Support Request
        for pat in cls.HUMAN_SUPPORT_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_HUMAN_SUPPORT

        # P2: Consequential App Actions (Booking / Cancelling)
        for pat in cls.ACTION_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_APP_ACTION

        # P3: App Navigation & Workflows (Queue, Follow-up, Directory)
        for pat in cls.QUEUE_PATTERNS + cls.FOLLOWUP_PATTERNS + cls.NAVIGATION_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_APP_NAVIGATION

        # P4: Report explanation
        for pat in cls.REPORT_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_REPORT_EXPLANATION

        # P5: Medicine information (Educational Pharmacology)
        for pat in cls.MEDICINE_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_MEDICINE_INFORMATION

        # P6: Appointment Help
        for pat in cls.APPOINTMENT_HELP_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_APPOINTMENT_HELP

        # P7: Greetings / Chitchat
        for pat in cls.CHITCHAT_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_GENERAL_CHITCHAT

        # Default to Clinical QA
        return ChatIntent.INTENT_CLINICAL_QA

    @classmethod
    def classify_granular_intent(cls, message: str) -> ChatIntent:
        """Granular 13-intent classifier matching the full application taxonomy."""
        lower = message.lower().strip()

        if cls.detect_emergency(lower):
            return ChatIntent.INTENT_EMERGENCY
        if cls.detect_prompt_injection(lower):
            return ChatIntent.INTENT_GENERAL_CHITCHAT
        for pat in cls.HUMAN_SUPPORT_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_HUMAN_SUPPORT
        for pat in cls.ACTION_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_APPOINTMENT_ACTION
        for pat in cls.APPOINTMENT_HELP_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_APPOINTMENT_HELP
        for pat in cls.QUEUE_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_QUEUE_HELP
        for pat in cls.FOLLOWUP_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_FOLLOW_UP_HELP
        for pat in cls.REPORT_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_REPORT_EXPLANATION
        for pat in cls.MEDICINE_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_MEDICINE_INFORMATION
        for pat in cls.NAVIGATION_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_NAVIGATION
        for pat in cls.CHITCHAT_PATTERNS:
            if re.search(pat, lower):
                return ChatIntent.INTENT_GENERAL_CHITCHAT
        if not lower or re.match(r"^[^a-zA-Z0-9]+$", lower):
            return ChatIntent.INTENT_UNCLEAR
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
        if intent in (
            ChatIntent.INTENT_CLINICAL_QA,
            ChatIntent.INTENT_MEDICINE_INFORMATION,
        ):
            # Never invent clinical facts when there is no retrieved evidence.
            if not citations:
                return NO_EVIDENCE_FALLBACK

            # Keep only non-empty retrieved evidence.
            evidence_blocks = []

            for doc in citations:
                content = (doc.text or "").strip()

                if not content:
                    continue

                heading = (
                    getattr(doc, "section_title", "")
                    or getattr(doc, "title", "Clinical information")
                )

                evidence_blocks.append(
                    f"### {heading}\n"
                    f"{content}\n"
                    f"Source: {doc.source_organization} — "
                    f"{doc.title} [{doc.doc_id}]"
                )

            if not evidence_blocks:
                return NO_EVIDENCE_FALLBACK

            # Deterministic mock: return actual retrieved evidence,
            # rather than an unrelated generic response.
            return (
                "Here is the relevant information from the "
                "clinical documents available to SwasthyaCare:\n\n"
                + "\n\n".join(evidence_blocks)
                + "\n\n"
                "This information is for general education and "
                "does not replace an individual medical assessment."
            )

        return NO_EVIDENCE_FALLBACK


SPECIALTY_DOCTOR_MAP: Dict[str, Tuple[str, str]] = {
    "Cardiology": ("Dr. Vikram Anand", "Cardiology & Vascular Medicine"),
    "Endocrinology": ("Dr. Sunita Rao", "Endocrinology & Diabetology"),
    "Pulmonology": ("Dr. Rajesh Gupta", "Pulmonology & Respiratory Medicine"),
    "Gastroenterology": ("Dr. Alok Verma", "Gastroenterology & Hepatology"),
    "Orthopedics": ("Dr. Priya Sen", "Orthopedics & Joint Replacement"),
    "Neurology": ("Dr. Rohan Mehta", "Neurology & Comprehensive Stroke Care"),
    "Dermatology": ("Dr. Ananya Roy", "Dermatology & Skin Biology"),
    "General_Medicine": ("Dr. Meera Sharma", "Internal & Preventive Medicine"),
}


class ChatRAGService:
    """
    Main Service orchestrating:
    1. Input sanitization & red-flag check
    2. Intent classification
    3. Dual-Corpus search (Platform vs Clinical)
    4. Response generation via pluggable provider (Claude Sonnet 5.5, OpenAI, or Mock)
    5. Action proposal generation
    6. Performance and token metadata tracking
    """

    def __init__(self, base_data_dir: Optional[str] = None):
        if not base_data_dir:
            base_data_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                "data",
            )
        self.corpus_manager = DualCorpusManager(base_data_dir)
        self.provider: BaseLLMProvider = ProviderFactory.get_provider()

    def _extract_action_proposal(self, message: str, intent: ChatIntent) -> Optional[ActionProposal]:
        if intent not in [ChatIntent.INTENT_APP_ACTION, ChatIntent.INTENT_APPOINTMENT_ACTION]:
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

        # Classical ML Specialty Routing (Task: ML-DEP-01)
        # Classify symptom context using trained TF-IDF + Calibrated Logistic Regression pipeline
        from app.services.specialty_classifier import specialty_classifier_service
        ml_result = specialty_classifier_service.predict(message)
        dept = ml_result.get("predicted_department", "General_Medicine")
        conf = ml_result.get("confidence", 0.5)

        default_doctor, specialization = SPECIALTY_DOCTOR_MAP.get(
            dept, ("Dr. Meera Sharma", "Internal & Preventive Medicine")
        )

        doctor_name = default_doctor
        if "dr." in lower or "doctor" in lower:
            doc_match = re.search(r"\b(dr\.?\s+[a-z]+)\b", lower)
            if doc_match:
                doctor_name = doc_match.group(1).title()

        return ActionProposal(
            action_type=ActionType.BOOK_APPOINTMENT,
            target_resource="appointment",
            parameters={
                "doctor_name": doctor_name,
                "specialization": specialization,
                "department": dept,
                "ml_routing_confidence": conf,
                "preferred_time": "Morning (10:00 AM - 12:00 PM)",
            },
            requires_confirmation=True,
            preview_summary=f"Request OPD appointment with {doctor_name} ({specialization})",
        )

    async def orchestrate(self, request: ChatOrchestrationRequest) -> ChatOrchestrationResponse:
        start_time = time.time()
        user_msg = request.message.strip()

        # Step 1: Detect intent
        intent = IntentClassifier.classify_intent(user_msg)
        is_emergency = intent == ChatIntent.INTENT_EMERGENCY

        # Step 1.5: Anti-Prescription & Dosage Refusal Guardrail
        if not is_emergency and IntentClassifier.detect_prescription_request(user_msg):
            elapsed_ms = int((time.time() - start_time) * 1000)
            return ChatOrchestrationResponse(
                intent=intent,
                is_emergency=False,
                response_text=PRESCRIPTION_REFUSAL_TEXT,
                citations=[],
                action_proposal=None,
                latency_ms=elapsed_ms,
                provider="anti-prescription-guardrail",
                model="clinical-safety-v1.0",
                tokens_used={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            )

        # Step 2: Retrieve from appropriate domain
        citations: List[DocumentChunk] = []
        if not is_emergency:
            if intent in [
                ChatIntent.INTENT_APP_NAVIGATION,
                ChatIntent.INTENT_NAVIGATION,
                ChatIntent.INTENT_APP_ACTION,
                ChatIntent.INTENT_APPOINTMENT_ACTION,
                ChatIntent.INTENT_APPOINTMENT_HELP,
                ChatIntent.INTENT_QUEUE_HELP,
                ChatIntent.INTENT_FOLLOW_UP_HELP,
                ChatIntent.INTENT_REPORT_EXPLANATION,
                ChatIntent.INTENT_ASSESSMENT_EXPLANATION,
                ChatIntent.INTENT_HUMAN_SUPPORT,
            ]:
                results = self.corpus_manager.search_platform(user_msg, top_k=2)
                citations = [r[0] for r in results]
            elif intent in [
                ChatIntent.INTENT_CLINICAL_QA,
                ChatIntent.INTENT_MEDICINE_INFORMATION,
            ]:
                results = self.corpus_manager.search_clinical(
                    user_msg,
                    top_k=5,
                )

                citations = [result[0] for result in results]

                logger.info(
                    "Clinical retrieval | Intent=%s | "
                    "Retrieved=%d | Document IDs=%s",
                    intent,
                    len(results),
                    [result[0].doc_id for result in results],
                )

                if not citations:
                    logger.warning(
                        "No clinical evidence retrieved. "
                        "Check clinical knowledge-base files and retrieval index."
                    )

        # Step 2.5: Verified Educational Pharmacology Intercept
        if intent == ChatIntent.INTENT_MEDICINE_INFORMATION:
            for drug in ["metformin", "telmisartan", "atorvastatin", "paracetamol"]:
                if drug in user_msg.lower():
                    summary = EducationalPharmacologyEngine.get_educational_summary(drug)
                    if summary:
                        elapsed_ms = int((time.time() - start_time) * 1000)
                        doc_map = {
                            "telmisartan": ("DOC-CLIN-02", "ICMR & Indian Guidelines on Hypertension (IGH-IV)"),
                            "metformin": ("DOC-CLIN-01", "ICMR Guidelines for Type 2 Diabetes"),
                            "atorvastatin": ("DOC-CLIN-03", "WHO HEARTS & ICMR Dyslipidemia Protocols"),
                            "paracetamol": ("DOC-CLIN-06", "Indian Pharmacopoeia & National Essential Medicines List"),
                        }
                        doc_id, org = doc_map.get(drug, ("DOC-CLIN-06", "Indian Pharmacopoeia"))
                        return ChatOrchestrationResponse(
                            intent=intent,
                            is_emergency=False,
                            response_text=summary,
                            citations=[
                                CitationItem(
                                    doc_id=doc_id,
                                    title=f"Pharmacology Standard: {drug.title()}",
                                    source_organization=org,
                                    snippet=summary[:200] + "...",
                                )
                            ],
                            action_proposal=None,
                            latency_ms=elapsed_ms,
                            provider="educational_pharmacology_engine",
                            model="deterministic_formulary_v1.0",
                            tokens_used={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
                        )

        # Step 3: Assemble action proposal via Classical ML Routing (if applicable)
        action_proposal = self._extract_action_proposal(user_msg, intent)

        # Enhance system prompt if an action proposal with clinical routing exists
        system_prompt = CLINICAL_SYSTEM_PROMPT
        if action_proposal and action_proposal.parameters:
            dept = action_proposal.parameters.get("department", "").replace("_", " ")
            doc = action_proposal.parameters.get("doctor_name", "")
            spec = action_proposal.parameters.get("specialization", "")
            if dept and doc:
                system_prompt += (
                    f"\n\n[SPECIALIST CLINICAL ROUTING CONTEXT]:\n"
                    f"The patient's symptom query has been matched by our classical ML specialty model to:\n"
                    f"- Department: {dept}\n"
                    f"- Recommended Specialist: {doc} ({spec})\n\n"
                    f"In your response:\n"
                    f"1. Acknowledge the patient's symptoms with warmth, clarity, and reassurance.\n"
                    f"2. Explain simply why their symptoms relate to {dept} (e.g. bone, joint and mobility care).\n"
                    f"3. Reassure them that you have matched them with {doc} ({spec}) and an appointment card is ready below for 1-click booking.\n"
                    f"4. Keep your answer brief (2-3 concise paragraphs), empathetic, and easy to understand."
                )

        # Step 3.5: Multi-Language & Hindi Communication Handling
        lang = getattr(request, "language", "en") or "en"
        has_devanagari = bool(re.search(r"[ऀ-ॿ]", user_msg))
        is_hindi = (lang == "hi") or has_devanagari

        if is_hindi:
            system_prompt += (
                "\n\n[MANDATORY BILINGUAL HINDI / हिन्दी GUIDANCE]:\n"
                "The patient has selected Hindi or is communicating in Hindi/Hinglish.\n"
                "You MUST generate your entire response in clear, polite, warm, and natural Hindi (using Devanagari script).\n"
                "Explain medical points in everyday accessible language that patients in India understand comfortably.\n"
                "Example phrases: 'नमस्ते! मैं आपकी मदद करने के लिए यहाँ हूँ', 'कृपया तुरंत डॉक्टर से संपर्क करें'.\n"
                "Do NOT use heavy or outdated Sanskrit terms. Keep your tone kind, professional, and empathetic like an experienced Indian physician."
            )

        # Step 4: Generate response via configured Provider
        conv_hist = [
            {"role": t.role.value if hasattr(t.role, "value") else str(t.role), "content": t.content}
            for t in request.conversation_history
        ]

        provider_res: ProviderResult = await self.provider.generate_async(
            prompt=user_msg,
            system_prompt=system_prompt,
            citations=citations,
            intent=intent,
            patient_context=request.patient_context,
            conversation_history=conv_hist,
        )

        # Step 5: Assemble citations metadata
        citation_items = [
            CitationItem(
                doc_id=c.doc_id,
                title=c.title,
                source_organization=c.source_organization,
                snippet=c.text[:200] + ("..." if len(c.text) > 200 else ""),
            )
            for c in citations
        ]

        elapsed_ms = int((time.time() - start_time) * 1000)

        return ChatOrchestrationResponse(
            intent=intent,
            is_emergency=is_emergency,
            response_text=provider_res.content,
            citations=citation_items,
            action_proposal=action_proposal,
            latency_ms=elapsed_ms,
            provider=provider_res.provider,
            model=provider_res.model,
            tokens_used={
                "prompt_tokens": provider_res.prompt_tokens,
                "completion_tokens": provider_res.completion_tokens,
                "total_tokens": provider_res.prompt_tokens + provider_res.completion_tokens,
            },
        )


# Global singleton instance for FastAPI runtime
chat_rag_service = ChatRAGService()
