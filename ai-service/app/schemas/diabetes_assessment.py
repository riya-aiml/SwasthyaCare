"""
SwasthyaCare — Pydantic Schemas for Diabetes Current-Status Assessment (ML-DIA-01)
Task: ML-S2-01 & ML-S2-06
Framework: Pydantic v2
"""

from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional, List
from datetime import datetime, timezone

# Standardized Clinical Disclaimer (SaMD Compliance)
CLINICAL_DISCLAIMER_DIABETES = (
    "EDUCATIONAL PROTOTYPE ONLY. This assessment reflects self-reported population survey "
    "patterns based on the CDC BRFSS. It does NOT measure blood sugar and is NOT a medical diagnosis. "
    "If you have metabolic health concerns or symptoms, consult a qualified physician for fasting "
    "plasma glucose and HbA1c diagnostic testing."
)

SCHEMA_VERSION_DIABETES = "v1.0.0"


class AssessmentProvenance(BaseModel):
    """
    Provenance and Audit Metadata for Submitted Biomarkers (Task ML-S2-06)
    Ensures input data can be traced to manual entry, OCR extraction, or clinical record.
    """
    source: Literal['manual_entry', 'ocr_extraction', 'clinical_ehr_import'] = Field(
        default='manual_entry',
        description="Origin of the submitted clinical parameters"
    )
    patient_confirmed: bool = Field(
        default=True,
        description="Explicit patient confirmation that values have been reviewed and verified"
    )
    entered_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp of input creation"
    )


class DiabetesAssessmentRequest(BaseModel):
    """
    Input Data Contract for Task ML-DIA-01: Diabetes Current-Status Assessment
    Based on the 21 predictors from the CDC BRFSS health indicators benchmark.
    """
    schema_version: str = Field(default=SCHEMA_VERSION_DIABETES, description="Schema contract version")
    provenance: AssessmentProvenance = Field(default_factory=AssessmentProvenance)

    # 1. Core Biometrics
    age: int = Field(..., ge=18, le=100, description="Patient chronological age in years (18-100)")
    sex: Literal['male', 'female', 'other'] = Field(..., description="Biological sex")
    bmi: float = Field(..., ge=12.0, le=70.0, description="Body Mass Index in kg/m2 (12.0 - 70.0)")

    # 2. Metabolic & Chronic Disease History
    high_bp: bool = Field(..., description="Ever diagnosed by a doctor with high blood pressure")
    high_chol: bool = Field(..., description="Ever diagnosed by a doctor with high blood cholesterol")
    chol_check_5yr: bool = Field(True, description="Had cholesterol checked by a clinician within past 5 years")
    stroke_history: bool = Field(False, description="History of stroke or transient ischemic attack")
    heart_disease_or_attack: bool = Field(False, description="History of myocardial infarction or coronary heart disease")

    # 3. Lifestyle & Behaviors
    smoker: bool = Field(..., description="Smoked at least 100 cigarettes in lifetime")
    phys_activity: bool = Field(..., description="Engaged in physical activity/exercise in past 30 days other than job")
    fruits_daily: bool = Field(..., description="Consumes fruit 1 or more times per day")
    veggies_daily: bool = Field(..., description="Consumes vegetables 1 or more times per day")
    heavy_alcohol: bool = Field(False, description="Heavy alcohol consumption (Men >14 drinks/week; Women >7 drinks/week)")

    # 4. General & Functional Health
    gen_hlth: int = Field(..., ge=1, le=5, description="General health rating (1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor)")
    ment_hlth_days: int = Field(..., ge=0, le=30, description="Number of days in past 30 days mental health was not good (0-30)")
    phys_hlth_days: int = Field(..., ge=0, le=30, description="Number of days in past 30 days physical health was not good (0-30)")
    diff_walk: bool = Field(False, description="Serious difficulty walking or climbing stairs")

    # 5. Access & Socioeconomic Identifiers
    any_healthcare: bool = Field(True, description="Has any kind of health insurance or medical coverage")
    no_doc_bc_cost: bool = Field(False, description="Could not see doctor in past 12 months due to financial cost")
    education_level: int = Field(default=4, ge=1, le=6, description="Education level scale 1-6 (1=Never attended, 6=College graduate)")
    income_level: int = Field(default=5, ge=1, le=8, description="Income bracket scale 1-8 (1=<10k, 8=>=75k)")

    @field_validator('bmi')
    def validate_bmi_bounds(cls, v):
        if v < 12.0 or v > 70.0:
            raise ValueError("BMI must be between 12.0 and 70.0 kg/m²")
        return round(v, 2)


class DiabetesAssessmentResponse(BaseModel):
    """
    Output Response Contract for Task ML-DIA-01
    Follows Section 6 of SwasthyaCare_ML_Sprint_Integration_v1.0.md
    """
    task_id: str = "ML-DIA-01"
    model_id: str = "diabetes-current-status-lr"
    model_version: str = "1.0.0"
    assessment_status: Literal['completed', 'inconclusive', 'rejected'] = 'completed'
    prediction: int = Field(..., description="0 = Not Indicative of Diabetes Pattern, 1 = Suggestive of Diabetes Pattern")
    probability: float = Field(..., ge=0.0, le=1.0, description="Estimated class probability between 0.0 and 1.0")
    output_label: str = Field(..., description="Approved non-diagnostic label")
    contributing_factors: List[str] = Field(default_factory=list, description="Primary drivers contributing to classification")
    lifestyle_recommendations: List[str] = Field(default_factory=list, description="Non-pharmacological guidance")
    limitations: List[str] = Field(
        default=[
            "Educational prototype based on cross-sectional CDC BRFSS survey patterns.",
            "Does NOT estimate future onset risk or replace biochemical HbA1c/plasma glucose tests.",
            "Does NOT differentiate between Type-1 and Type-2 Diabetes."
        ]
    )
    disclaimer: str = CLINICAL_DISCLAIMER_DIABETES
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
