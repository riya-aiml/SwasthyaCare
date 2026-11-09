from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime, timezone

# Mandatory Clinical Safety Disclaimer (Sprint 6 Acceptance Criteria)
CLINICAL_DISCLAIMER = (
    "PRELIMINARY RISK ESTIMATE ONLY. This assessment is a statistical prototype and "
    "DOES NOT constitute a medical diagnosis, clinical prognosis, or treatment plan. "
    "All decisions regarding patient care, pharmacotherapy, or diagnostic workup must be "
    "made by a qualified, licensed healthcare professional."
)

MODEL_VERSION = "v1.2.0-prototype"


class HeartRiskRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Patient age in years (18-100)")
    gender: str = Field(..., description="'male' or 'female'")
    systolic_bp: int = Field(..., ge=70, le=260, description="Systolic blood pressure in mmHg (70-260)")
    diastolic_bp: int = Field(..., ge=40, le=160, description="Diastolic blood pressure in mmHg (40-160)")
    total_cholesterol: int = Field(..., ge=80, le=450, description="Total cholesterol in mg/dL (80-450)")
    hdl_cholesterol: int = Field(..., ge=15, le=120, description="HDL cholesterol in mg/dL (15-120)")
    smoker: bool = Field(..., description="Current smoker status")
    diabetic: bool = Field(..., description="Diagnosed diabetic status")
    on_bp_medication: bool = Field(False, description="Treated for hypertension")

    @field_validator('gender')
    def validate_gender(cls, v):
        if v.lower() not in ['male', 'female', 'm', 'f']:
            raise ValueError("Gender must be 'male' or 'female'")
        return v.lower()


class HeartRiskResponse(BaseModel):
    model_id: str = "swasthya-cardiac-risk"
    model_version: str = MODEL_VERSION
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    ten_year_risk_percentage: float
    risk_category: str  # "LOW", "BORDERLINE", "INTERMEDIATE", "HIGH"
    contributing_factors: List[str]
    recommendations: List[str]
    disclaimer: str = CLINICAL_DISCLAIMER


class DiabetesRiskRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Patient age in years (18-100)")
    bmi: float = Field(..., ge=12.0, le=70.0, description="Body Mass Index kg/m2 (12-70)")
    waist_circumference_cm: float = Field(..., ge=40.0, le=200.0, description="Waist circumference in cm (40-200)")
    daily_physical_activity: bool = Field(..., description="At least 30 mins daily physical activity")
    diet_vegetables_daily: bool = Field(..., description="Eats vegetables/fruits daily")
    history_high_bp: bool = Field(..., description="History of treated or elevated blood pressure")
    history_high_glucose: bool = Field(..., description="Ever found to have high blood sugar")
    family_history_diabetes: str = Field(..., description="'none', 'second_degree', or 'first_degree'")

    @field_validator('family_history_diabetes')
    def validate_family_history(cls, v):
        if v.lower() not in ['none', 'second_degree', 'first_degree']:
            raise ValueError("Family history must be 'none', 'second_degree', or 'first_degree'")
        return v.lower()


class DiabetesRiskResponse(BaseModel):
    model_id: str = "swasthya-diabetes-findrisc"
    model_version: str = MODEL_VERSION
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    risk_score: int  # 0 to 26
    ten_year_risk_percentage: float
    risk_category: str  # "LOW", "SLIGHTLY_ELEVATED", "MODERATE", "HIGH", "VERY_HIGH"
    key_drivers: List[str]
    preventive_guidelines: List[str]
    disclaimer: str = CLINICAL_DISCLAIMER
