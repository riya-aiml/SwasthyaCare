from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RecoveryRiskRequest(BaseModel):
    recovery_rating: int = Field(..., ge=1, le=5, description="Overall recovery rating (1-5)")
    pain_level: int = Field(..., ge=0, le=10, description="Subjective pain level (0-10)")
    mobility_score: str = Field("Normal", description="Mobility status: Normal, Slightly Restricted, Significantly Restricted, Bedridden")
    systolic_bp: Optional[float] = Field(None, description="Systolic blood pressure in mmHg")
    diastolic_bp: Optional[float] = Field(None, description="Diastolic blood pressure in mmHg")
    heart_rate: Optional[float] = Field(None, description="Heart rate in bpm")
    temperature_celsius: Optional[float] = Field(None, description="Body temperature in Celsius")
    oxygen_saturation: Optional[float] = Field(None, description="SpO2 percentage (e.g. 98)")
    blood_glucose: Optional[float] = Field(None, description="Blood glucose level in mg/dL")
    medication_adherence: str = Field("Full", description="Medication adherence: Full, Partial, Missed, None")
    current_symptoms: List[str] = Field(default_factory=list, description="List of self-reported symptoms")
    has_warning_symptoms: bool = Field(False, description="Flag indicating presence of critical warning symptoms")
    patient_notes: Optional[str] = Field(None, description="Free-text patient recovery notes")
    days_post_discharge: Optional[int] = Field(1, description="Days elapsed since hospital discharge")
    previous_pain_level: Optional[int] = Field(None, description="Previous recorded pain level for trajectory calculation")
    previous_recovery_rating: Optional[int] = Field(None, description="Previous recorded recovery rating")

class RecoveryRiskResponse(BaseModel):
    risk_score: float = Field(..., description="Deterioration risk score from 0 (minimal) to 100 (critical)")
    health_index: float = Field(..., description="Recovery Health Index from 0 (critical) to 100 (optimal)")
    risk_tier: str = Field(..., description="Risk category: STABLE, MODERATE_RISK, CRITICAL_ATTENTION")
    contributing_factors: List[str] = Field(default_factory=list, description="Primary clinical drivers influencing the score")
    nlp_detected_alerts: List[str] = Field(default_factory=list, description="Alerts extracted from patient free-text notes")
    clinician_recommendation: str = Field(..., description="Actionable clinical guidance for the attending clinician")
    patient_guidance: str = Field(..., description="Reassuring, clear next steps for the patient")
    requires_escalation: bool = Field(False, description="Whether this update requires urgent clinician intervention")
    model_id: str = "ML-REC-01"
    model_version: str = "1.0.0"
