"""
SwasthyaCare AI Service — Conversational Assistant Schemas
Sprint 9: Task S9-08
Data contracts for internal chat orchestration, intent classification, and dual-RAG retrieval.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime, timezone

# Standard Clinical Chat Disclaimers (Sprint 9: S9-07)
CLINICAL_CHAT_DISCLAIMER = (
    "SwasthyaCare Assistant provides general health information and hospital navigation only. "
    "It is not a diagnostic tool and cannot prescribe medications. Always consult a qualified "
    "physician for medical decisions."
)

PRESCRIPTION_REFUSAL_TEXT = (
    "I cannot recommend or prescribe medications, dosages, or drug alterations. Only a licensed "
    "physician can evaluate your condition and provide a valid prescription. Please book an "
    "appointment with a doctor through SwasthyaCare."
)


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatIntent(str, Enum):
    INTENT_EMERGENCY = "INTENT_EMERGENCY"
    INTENT_APP_ACTION = "INTENT_APP_ACTION"
    INTENT_APP_NAVIGATION = "INTENT_APP_NAVIGATION"
    INTENT_REPORT_EXPLANATION = "INTENT_REPORT_EXPLANATION"
    INTENT_CLINICAL_QA = "INTENT_CLINICAL_QA"
    INTENT_GENERAL_CHITCHAT = "INTENT_GENERAL_CHITCHAT"
    INTENT_UNKNOWN = "INTENT_UNKNOWN"


class ActionType(str, Enum):
    BOOK_APPOINTMENT = "BOOK_APPOINTMENT"
    CANCEL_APPOINTMENT = "CANCEL_APPOINTMENT"
    VIEW_RISK_REPORT = "VIEW_RISK_REPORT"
    SUBMIT_FOLLOWUP = "SUBMIT_FOLLOWUP"
    NONE = "NONE"


class ActionProposal(BaseModel):
    action_type: ActionType = ActionType.NONE
    target_resource: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    requires_confirmation: bool = True
    preview_summary: Optional[str] = None


class CitationItem(BaseModel):
    doc_id: str = Field(..., description="Unique document ID (e.g. DOC-CLIN-01)")
    title: str = Field(..., description="Document or guideline title")
    source_organization: str = Field(..., description="ICMR, WHO, MoHFW, or SwasthyaCare")
    snippet: Optional[str] = None


class ChatTurn(BaseModel):
    role: MessageRole
    content: str = Field(..., max_length=4000)


class ChatOrchestrationRequest(BaseModel):
    user_id: str = Field(..., description="Sanitized patient/user ObjectId from JWT")
    user_role: str = Field("patient", description="User role ('patient' or 'doctor')")
    message: str = Field(..., min_length=1, max_length=1000, description="Incoming user query")
    conversation_history: List[ChatTurn] = Field(default_factory=list, description="Bounded previous turns (max 10)")
    patient_context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Age, gender, recent risk assessments")


class ChatOrchestrationResponse(BaseModel):
    intent: ChatIntent
    is_emergency: bool = False
    response_text: str
    citations: List[CitationItem] = Field(default_factory=list)
    action_proposal: Optional[ActionProposal] = None
    disclaimer: str = CLINICAL_CHAT_DISCLAIMER
    latency_ms: int = Field(0, description="Processing duration in milliseconds")
    provider: str = Field("deterministic-mock", description="LLM provider used (anthropic, openai, or mock)")
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
