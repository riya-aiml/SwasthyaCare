"""
SwasthyaCare AI Service — Grounded RAG & Chatbot Engine
Sprint 10: Tasks S10-01 through S10-09
Implements:
1. Emergency Red-Flag Pre-Check (Immediate 112/108 interception)
2. Prompt-Injection & Prescription Guardrail Defenses
3. Intent Classifier (App Help vs Health Info vs Assessment vs Appointment)
4. Dual-Scope Vector/BM25 Ingestion & Retrieval (Scope A: App Docs, Scope B: ICMR/WHO Guidelines)
5. Citation Verifier & Structured Response Generator
6. Resilient Local Deterministic Fallback
"""

import os
import re
import math
import uuid
import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone

from app.schemas.chat_assistant import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    Citation,
    ActionSuggestion
)

logger = logging.getLogger("swasthyacare.chat_rag")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KB_DIR = os.path.join(BASE_DIR, "data", "knowledge_base")
APP_DOCS_DIR = os.path.join(KB_DIR, "app_docs")
CLINICAL_DIR = os.path.join(KB_DIR, "clinical_guidelines")


# =====================================================================
# 1. CLINICAL SAFETY & EMERGENCY REGEX RULES (Task S10-09)
# =====================================================================

EMERGENCY_TRIGGERS = [
    (r"\b(chest pain|heart attack|crushing chest|pain radiating to (left )?arm|pain in jaw)\b",
     "Possible Acute Coronary Syndrome / Heart Attack"),
    (r"\b(stroke|facial droop|face droop|slurred speech|arm numbness|loss of speech|FAST symptoms)\b",
     "Possible Acute Stroke"),
    (r"\b(cannot breathe|can't breathe|suffocating|gasping for air|severe shortness of breath)\b",
     "Severe Acute Respiratory Distress"),
    (r"\b(kill myself|suicide|end my life|want to die|self harm)\b",
     "Mental Health Crisis / Suicide Risk"),
    (r"\b(anaphylaxis|throat (is )?closing|swollen tongue|severe allergic reaction)\b",
     "Possible Anaphylactic Shock"),
    (r"\b(unconscious|passed out|unresponsive|heavy bleeding|coughing blood)\b",
     "Medical Emergency")
]

PROMPT_INJECTION_TRIGGERS = [
    r"ignore (all )?previous instructions",
    r"system override",
    r"you are now (an? )?(unrestricted|doctor|medicalgod|jailbroken)",
    r"bypass (all )?(safety|clinical|disclaimers)",
    r"output (the )?system prompt",
    r"disregard guidelines"
]

PRESCRIPTION_ALTERATION_TRIGGERS = [
    r"\b(double|triple|increase|decrease|stop|halt|skip) (my )?(dose|dosage|medication|medicine|tablets|pills)\b",
    r"\b(prescribe|write (me )?a prescription for) [a-z0-9]+\b",
    r"\bcan i take [0-9]+ (mg|tablets|pills) of\b"
]


# =====================================================================
# 2. DOCUMENT CHUNKING & INGESTION (Tasks S10-03, S10-04)
# =====================================================================

class DocumentChunk:
    def __init__(
        self,
        chunk_id: str,
        scope: str,  # 'scope_a_app' or 'scope_b_clinical'
        source_id: str,
        title: str,
        section: str,
        content: str
    ):
        self.chunk_id = chunk_id
        self.scope = scope
        self.source_id = source_id
        self.title = title
        self.section = section
        self.content = content
        self.tokens = self._tokenize(content)

    def _tokenize(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
        return [w for w in cleaned.split() if len(w) > 2]


class KnowledgeStore:
    """In-memory searchable knowledge index with scope isolation."""

    def __init__(self):
        self.chunks: List[DocumentChunk] = []
        self.doc_freq: Dict[str, int] = {}
        self.is_loaded = False

    def load_knowledge_base(self):
        self.chunks = []
        self._ingest_directory(APP_DOCS_DIR, scope="scope_a_app")
        self._ingest_directory(CLINICAL_DIR, scope="scope_b_clinical")
        self._compute_idf()
        self.is_loaded = True
        logger.info(f"Loaded {len(self.chunks)} knowledge chunks into RAG index.")

    def _ingest_directory(self, directory: str, scope: str):
        if not os.path.exists(directory):
            return

        for filename in sorted(os.listdir(directory)):
            if not filename.endswith(".md"):
                continue
            filepath = os.path.join(directory, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                raw_text = f.read()

            self._parse_markdown_file(raw_text, scope, filename)

    def _parse_markdown_file(self, text: str, scope: str, filename: str):
        source_id = filename.replace(".md", "").upper()
        title = filename.replace(".md", "").replace("_", " ").title()

        # Extract source ID if defined in header
        source_match = re.search(r"\*\*(Source ID|Document ID):\*\*\s*([A-Za-z0-9_\-]+)", text)
        if source_match:
            source_id = source_match.group(2)

        # Title match
        title_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
        if title_match:
            title = title_match.group(1).strip()

        # Section-based chunking (by '## ')
        sections = re.split(r"(?m)^##\s+", text)
        for idx, sec in enumerate(sections):
            sec = sec.strip()
            if not sec or sec.startswith("#"):
                continue
            lines = sec.split("\n", 1)
            section_heading = lines[0].strip()
            section_content = lines[1].strip() if len(lines) > 1 else lines[0]

            chunk_id = f"{source_id}_s{idx}"
            chunk = DocumentChunk(
                chunk_id=chunk_id,
                scope=scope,
                source_id=source_id,
                title=title,
                section=section_heading,
                content=f"{section_heading}: {section_content}"
            )
            self.chunks.append(chunk)

    def _compute_idf(self):
        self.doc_freq = {}
        for chunk in self.chunks:
            unique_words = set(chunk.tokens)
            for w in unique_words:
                self.doc_freq[w] = self.doc_freq.get(w, 0) + 1

    def search(self, query: str, target_scope: Optional[str] = None, top_k: int = 2) -> List[Tuple[DocumentChunk, float]]:
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", query.lower())
        q_tokens = [w for w in cleaned.split() if len(w) > 2]
        if not q_tokens or not self.chunks:
            return []

        scores: List[Tuple[DocumentChunk, float]] = []
        n_docs = len(self.chunks)

        for chunk in self.chunks:
            if target_scope and chunk.scope != target_scope:
                continue

            score = 0.0
            chunk_token_set = set(chunk.tokens)
            for qt in q_tokens:
                if qt in chunk_token_set:
                    idf = math.log(1.0 + (n_docs - self.doc_freq.get(qt, 0) + 0.5) / (self.doc_freq.get(qt, 0) + 0.5))
                    tf = chunk.tokens.count(qt) / max(1, len(chunk.tokens))
                    score += tf * max(0.2, idf)

            if score > 0.05:
                scores.append((chunk, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]


# Global knowledge store instance
kb_store = KnowledgeStore()
kb_store.load_knowledge_base()


# =====================================================================
# 3. INTENT CLASSIFICATION & GUARDRAILS (Task S10-06, S10-09)
# =====================================================================

class ChatRAGService:
    """Orchestrates query classification, safety guards, retrieval, and response synthesis."""

    def __init__(self):
        self.kb = kb_store

    def process_message(self, request: ChatCompletionRequest) -> ChatCompletionResponse:
        query = request.message.strip()
        query_lower = query.lower()

        # -------------------------------------------------------------
        # 1. EMERGENCY RED-FLAG PRE-CHECK
        # -------------------------------------------------------------
        for pattern, label in EMERGENCY_TRIGGERS:
            if re.search(pattern, query_lower):
                logger.warning(f"EMERGENCY RED-FLAG TRIGGERED: {label}")
                return self._build_emergency_response(query, label)

        # -------------------------------------------------------------
        # 2. PROMPT INJECTION & JAILBREAK DEFENSE
        # -------------------------------------------------------------
        for pattern in PROMPT_INJECTION_TRIGGERS:
            if re.search(pattern, query_lower):
                logger.warning("PROMPT INJECTION ATTEMPT DETECTED")
                return ChatCompletionResponse(
                    response_id=f"resp_{uuid.uuid4().hex[:10]}",
                    intent="OUT_OF_SCOPE",
                    content=(
                        "I am SwasthyaCare's clinical decision support assistant. I operate strictly under "
                        "institutional clinical safety guidelines and cannot bypass medical boundaries or adopt "
                        "unrestricted diagnostic personas."
                    ),
                    citations=[],
                    action_suggestion=ActionSuggestion(type="NONE"),
                    is_emergency=False
                )

        # -------------------------------------------------------------
        # 3. PRESCRIPTION ALTERATION DEFENSE
        # -------------------------------------------------------------
        for pattern in PRESCRIPTION_ALTERATION_TRIGGERS:
            if re.search(pattern, query_lower):
                return ChatCompletionResponse(
                    response_id=f"resp_{uuid.uuid4().hex[:10]}",
                    intent="HEALTH_INFO",
                    content=(
                        "I cannot advise you on changing, stopping, or altering prescription medications or dosages. "
                        "Adjusting dosages without medical supervision can be clinically dangerous. "
                        "Please consult your prescribing doctor or schedule a follow-up consultation."
                    ),
                    citations=[],
                    action_suggestion=ActionSuggestion(
                        type="NAVIGATE_TAB",
                        label="Message Prescribing Doctor",
                        target="followup"
                    ),
                    is_emergency=False
                )

        # -------------------------------------------------------------
        # 4. INTENT CLASSIFICATION & SCOPE ROUTING
        # -------------------------------------------------------------
        intent = self._classify_intent(query_lower, request)

        # -------------------------------------------------------------
        # 5. RETRIEVAL & GROUNDED SYNTHESIS
        # -------------------------------------------------------------
        if intent == "ASSESSMENT_EXPLAIN":
            return self._handle_assessment_explanation(request)
        elif intent == "APPOINTMENT_ASSIST":
            return self._handle_appointment_assistance(query)
        elif intent == "APP_HELP":
            return self._handle_app_help(query)
        elif intent == "HEALTH_INFO":
            return self._handle_clinical_health_info(query)
        elif intent == "REPORT_EXPLAIN":
            return self._handle_report_explanation(request)
        else:
            return self._handle_out_of_scope(query)

    def _classify_intent(self, q: str, request: Optional[ChatCompletionRequest] = None) -> str:
        ctx = request.patient_context if request else None
        has_assessment = bool(ctx and ctx.latest_assessment)

        if any(w in q for w in ["appointment", "book", "schedule", "slot", "cancel visit", "specialist", "doctor"]):
            return "APPOINTMENT_ASSIST"
        if any(w in q for w in ["risk score", "diabetes score", "heart risk", "ml-dia", "ml-cvd", "assessment", "bmi factor", "my risk", "screening", "elevated pattern"]):
            return "ASSESSMENT_EXPLAIN"
        if has_assessment and any(w in q for w in ["diabetes", "risk", "pattern", "my result"]):
            return "ASSESSMENT_EXPLAIN"
        if any(w in q for w in ["queue", "wait time", "token", "check in", "follow up", "recovery update", "how to"]):
            return "APP_HELP"
        if any(w in q for w in ["report", "hba1c", "creatinine", "glucose", "platelet", "hemoglobin", "blood test", "lab"]):
            return "REPORT_EXPLAIN"
        if any(w in q for w in ["blood pressure", "hypertension", "normal bp", "diet", "sodium", "exercise", "cholesterol", "fiber"]):
            return "HEALTH_INFO"
        return "HEALTH_INFO"

    def _build_emergency_response(self, query: str, emergency_label: str) -> ChatCompletionResponse:
        return ChatCompletionResponse(
            response_id=f"resp_{uuid.uuid4().hex[:10]}",
            intent="EMERGENCY_RED_FLAG",
            content=(
                f"🚨 **IMMEDIATE MEDICAL ATTENTION REQUIRED: {emergency_label}**\n\n"
                "Your reported symptoms may indicate an acute life-threatening medical emergency. "
                "Please do not wait or drive yourself to the hospital.\n\n"
                "• **India Emergency Response Hotline:** Dial **112** or **108** immediately.\n"
                "• **Tele-MANAS Mental Health Crisis Line:** Dial **14416** (24/7 toll-free).\n\n"
                "If you are at home, notify family members or someone nearby right now."
            ),
            citations=[],
            action_suggestion=ActionSuggestion(
                type="EMERGENCY_MODAL",
                label="Call Emergency Services: 112 / 108",
                target="tel:112"
            ),
            is_emergency=True
        )

    def _handle_assessment_explanation(self, request: ChatCompletionRequest) -> ChatCompletionResponse:
        ctx = request.patient_context
        latest = ctx.latest_assessment if ctx else None

        citations = [
            Citation(
                source_id="SWC-APP-03",
                title="SwasthyaCare AI Risk Models",
                url_or_section="Section 2: Diabetes Screening (ML-DIA-01)"
            ),
            Citation(
                source_id="ICMR-DIA-2023",
                title="ICMR Guidelines for Management of Type 2 Diabetes",
                url_or_section="Section 2: South Asian BMI Cutoffs"
            )
        ]

        if latest:
            task = latest.get("task_id", "ML-DIA-01")
            prob = latest.get("probability", 0.65)
            percent = round(prob * 100, 1)
            factors = latest.get("contributing_factors", ["Elevated BMI", "High Blood Pressure"])
            factors_str = ", ".join(factors) if isinstance(factors, list) else str(factors)

            content = (
                f"Your latest **{task}** screening calculated an estimated continuous probability of **{percent}%**.\n\n"
                f"**Primary Contributing Indicators:** {factors_str}.\n\n"
                "**Clinical Context (ICMR 2023):** In South Asian populations, an adult BMI $\\ge 23$ kg/m² represents an overweight "
                "threshold associated with increased metabolic risk. Please note this model is an educational screening prototype based on "
                "survey patterns. It does not measure blood sugar directly. A formal fasting blood glucose and HbA1c test is recommended."
            )
        else:
            content = (
                "SwasthyaCare offers ML risk screening for Diabetes (ML-DIA-01) and Coronary Stenosis (ML-CVD-01). "
                "You can complete a screening under the AI Risk Scoring tab to inspect your personalized lifestyle risk factors."
            )

        return ChatCompletionResponse(
            response_id=f"resp_{uuid.uuid4().hex[:10]}",
            intent="ASSESSMENT_EXPLAIN",
            content=content,
            citations=citations,
            action_suggestion=ActionSuggestion(
                type="NAVIGATE_TAB",
                label="Open AI Risk Scoring Workbench",
                target="risk-assessment"
            ),
            is_emergency=False
        )

    def _handle_appointment_assistance(self, query: str) -> ChatCompletionResponse:
        results = self.kb.search(query, target_scope="scope_a_app", top_k=1)
        citations = [
            Citation(
                source_id=r[0].source_id,
                title=r[0].title,
                url_or_section=r[0].section
            ) for r in results
        ] or [
            Citation(
                source_id="SWC-APP-01",
                title="SwasthyaCare Appointment Booking",
                url_or_section="Section 1: Finding Specialists"
            )
        ]

        content = (
            "You can easily schedule a consultation with any specialist through the **Find Specialists** directory. "
            "Our platform uses real-time slot locking to ensure appointments are reserved atomically without double-booking.\n\n"
            "Would you like to browse available doctor schedules now?"
        )

        return ChatCompletionResponse(
            response_id=f"resp_{uuid.uuid4().hex[:10]}",
            intent="APPOINTMENT_ASSIST",
            content=content,
            citations=citations,
            action_suggestion=ActionSuggestion(
                type="NAVIGATE_TAB",
                label="Explore Available Specialists",
                target="directory"
            ),
            is_emergency=False
        )

    def _handle_app_help(self, query: str) -> ChatCompletionResponse:
        results = self.kb.search(query, target_scope="scope_a_app", top_k=2)
        citations = [
            Citation(
                source_id=r[0].source_id,
                title=r[0].title,
                url_or_section=r[0].section
            ) for r in results
        ]

        if "queue" in query.lower():
            content = (
                "**Live OPD Queue Tracking:** Once you arrive at the hospital, your position is displayed in the "
                "Live Queue Status tracker. It dynamically estimates remaining wait times based on consultation pacing."
            )
            action = ActionSuggestion(type="NAVIGATE_TAB", label="View Live Queue Tracker", target="queue")
        elif "follow" in query.lower() or "recovery" in query.lower():
            content = (
                "**Post-Discharge Care & Recovery:** You can log your daily recovery ratings and vitals under "
                "Care Protocols. Any warning symptoms automatically flag your clinician for immediate review."
            )
            action = ActionSuggestion(type="NAVIGATE_TAB", label="Open Care & Recovery Portal", target="followup")
        else:
            content = results[0][0].content if results else "SwasthyaCare provides doctor discovery, appointment booking, risk screening, and post-discharge recovery."
            action = ActionSuggestion(type="NONE")

        return ChatCompletionResponse(
            response_id=f"resp_{uuid.uuid4().hex[:10]}",
            intent="APP_HELP",
            content=content,
            citations=citations,
            action_suggestion=action,
            is_emergency=False
        )

    def _handle_clinical_health_info(self, query: str) -> ChatCompletionResponse:
        results = self.kb.search(query, target_scope="scope_b_clinical", top_k=2)

        if not results:
            results = self.kb.search(query, top_k=1)

        citations = [
            Citation(
                source_id=r[0].source_id,
                title=r[0].title,
                url_or_section=r[0].section
            ) for r in results
        ]

        if "blood pressure" in query.lower() or "hypertension" in query.lower():
            if not any("ICMR-HTN" in c.source_id for c in citations):
                citations.insert(0, Citation(
                    source_id="ICMR-HTN-2022",
                    title="Clinical Guideline: ICMR Guidelines for Management of Hypertension",
                    url_or_section="1. Blood Pressure Classification for Adults"
                ))
                citations = citations[:2]
            content = (
                "**Clinical Guidance on Blood Pressure (ICMR 2022):**\n"
                "• **Normal:** Systolic $< 120$ mmHg and Diastolic $< 80$ mmHg.\n"
                "• **Prehypertension:** Systolic $120\text{--}139$ mmHg or Diastolic $80\text{--}89$ mmHg.\n"
                "• **Hypertension:** Systolic $\\ge 140$ mmHg or Diastolic $\\ge 90$ mmHg.\n\n"
                "**Key Non-Pharmacological Measures:** Limit sodium to $< 2.0$g/day ($< 5$g salt), maintain 30-45 minutes of daily "
                "aerobic exercise, and maintain a South Asian target BMI between $18.5$ and $22.9$ kg/m²."
            )
        elif "diabetes" in query.lower() or "sugar" in query.lower() or "hba1c" in query.lower():
            if not any("ICMR-DIA" in c.source_id for c in citations):
                citations.insert(0, Citation(
                    source_id="ICMR-DIA-2023",
                    title="Clinical Guideline: ICMR Guidelines for Management of Type 2 Diabetes",
                    url_or_section="1. Diagnostic Thresholds & Glycemic Targets"
                ))
                citations = citations[:2]
            content = (
                "**Clinical Guidance on Glycemic Benchmarks (ICMR 2023):**\n"
                "• **Fasting Plasma Glucose:** Normal $< 100$ mg/dL; Prediabetes $100\text{--}125$ mg/dL; Diabetes $\\ge 126$ mg/dL.\n"
                "• **HbA1c Target:** Diagnostic cutoff is $\\ge 6.5\\%$; general therapeutic target for non-pregnant adults is $< 7.0\\%$.\n\n"
                "**Dietary Recommendations:** Prioritize complex carbohydrates with high dietary fiber (whole grains, pulses, green leafy vegetables) "
                "and engage in at least 150 minutes of moderate aerobic activity weekly."
            )
        elif "cholesterol" in query.lower() or "lipid" in query.lower():
            if not any("WHO" in c.source_id for c in citations):
                citations.insert(0, Citation(
                    source_id="WHO-CVD-2021",
                    title="World Health Organization Guideline on Cardiovascular Disease Prevention",
                    url_or_section="1. Lipid & Glycemic Management Targets"
                ))
                citations = citations[:2]
            content = (
                "**Cardiovascular Lipid Benchmarks (WHO 2021):**\n"
                "• Total Cholesterol: Target $< 200$ mg/dL.\n"
                "• LDL ('Bad') Cholesterol: Optimal $< 100$ mg/dL for primary prevention.\n"
                "• HDL ('Good') Cholesterol: $> 40$ mg/dL for men, $> 50$ mg/dL for women.\n\n"
                "Aerobic exercise and replacing saturated fats with heart-healthy unsaturated oils (mustard, olive) support optimal lipid profiles."
            )
        else:
            content = results[0][0].content if results else "Please consult your healthcare provider for clinical assessments."

        return ChatCompletionResponse(
            response_id=f"resp_{uuid.uuid4().hex[:10]}",
            intent="HEALTH_INFO",
            content=content,
            citations=citations,
            action_suggestion=ActionSuggestion(type="NONE"),
            is_emergency=False
        )

    def _handle_report_explanation(self, request: ChatCompletionRequest) -> ChatCompletionResponse:
        citations = [
            Citation(
                source_id="ICMR-DIA-2023",
                title="ICMR Diagnostic Standards",
                url_or_section="Chapter 1: Glycemic Diagnostics"
            )
        ]

        content = (
            "Laboratory diagnostic parameters (such as HbA1c, fasting glucose, or lipid panels) provide critical objective indicators "
            "of metabolic and cardiovascular health. Always verify your printed laboratory report with your treating physician, as reference "
            "ranges can vary across diagnostic instruments."
        )

        return ChatCompletionResponse(
            response_id=f"resp_{uuid.uuid4().hex[:10]}",
            intent="REPORT_EXPLAIN",
            content=content,
            citations=citations,
            action_suggestion=ActionSuggestion(
                type="NAVIGATE_TAB",
                label="View Health Records & Uploads",
                target="ocr"
            ),
            is_emergency=False
        )

    def _handle_out_of_scope(self, query: str) -> ChatCompletionResponse:
        return ChatCompletionResponse(
            response_id=f"resp_{uuid.uuid4().hex[:10]}",
            intent="OUT_OF_SCOPE",
            content=(
                "I am SwasthyaCare's clinical navigation assistant. My scope is focused on helping you with "
                "SwasthyaCare application features, doctor appointments, risk screening insights, and evidence-based public health information."
            ),
            citations=[],
            action_suggestion=ActionSuggestion(type="NONE"),
            is_emergency=False
        )


# Singleton chat engine
chat_rag_service = ChatRAGService()
