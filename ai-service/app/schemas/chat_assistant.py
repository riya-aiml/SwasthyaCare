"""
SwasthyaCare AI Service — Conversational Assistant Schemas
Sprint 10: Task S10-06 & S10-07
Pydantic v2 schemas for internal chat orchestration, intent classification,
dual-scope retrieval, action suggestions, and clinical safety disclaimers.
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any
from datetime import datetime, timezone


class Citation(BaseModel):
    source_id: str = Field(..., description="Unique institutional identifier (e.g. ICMR-DIA-2023)")
    title: str = Field(..., description="Formal guideline or documentation title")
    url_or_section: Optional[str] = Field(None, description="Specific chapter, section or link")


class ActionSuggestion(BaseModel):
    type: Literal[
        'NAVIGATE_TAB',
        'CONFIRM_BOOKING',
        'CONFIRM_CANCEL',
        'ESCALATE_DOCTOR',
        'EMERGENCY_MODAL',
        'NONE'
    ] = 'NONE'
    label: Optional[str] = Field(None, description="Button label shown on the client action card")
    target: Optional[str] = Field(None, description="Navigation target or entity ID")
    payload: Optional[Dict[str, Any]] = Field(None, description="Action payload metadata")


class PatientContext(BaseModel):
    patient_id: Optional[str] = None
    first_name: Optional[str] = None
    confirmed_vitals: Optional[Dict[str, Any]] = None
    latest_assessment: Optional[Dict[str, Any]] = None
    next_appointment: Optional[Dict[str, Any]] = None


class ChatCompletionRequest(BaseModel):
    session_id: str = Field(..., description="MongoDB ChatSession ID")
    user_id: str = Field(..., description="Authenticated Patient User ID")
    message: str = Field(..., min_length=1, max_length=2000, description="Patient text query")
    locale: Literal['en', 'hi'] = 'en'
    patient_context: Optional[PatientContext] = None


class ChatCompletionResponse(BaseModel):
    response_id: str
    intent: Literal[
        'APP_HELP',
        'HEALTH_INFO',
        'ASSESSMENT_EXPLAIN',
        'REPORT_EXPLAIN',
        'APPOINTMENT_ASSIST',
        'EMERGENCY_RED_FLAG',
        'OUT_OF_SCOPE'
    ]
    content: str
    citations: List[Citation] = Field(default_factory=list)
    action_suggestion: ActionSuggestion = Field(default_factory=ActionSuggestion)
    is_emergency: bool = False
    disclaimer: str = (
        "EDUCATIONAL DECISION-SUPPORT PROTOTYPE ONLY: SwasthyaCare Assistant provides non-diagnostic "
        "health navigation. It does not replace medical consultation. For emergencies, dial 112 or 108."
    )
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
