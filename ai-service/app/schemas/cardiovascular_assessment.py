"""
SwasthyaCare — Pydantic Schemas for Cardiovascular Current-Status Assessment (ML-CVD-01)
Task: ML-S2-02 & ML-S2-06
Framework: Pydantic v2
"""

from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional, List
from datetime import datetime, timezone

# Standardized Clinical Disclaimer (SaMD Compliance)
CLINICAL_DISCLAIMER_CVD = (
    "EDUCATIONAL PROTOTYPE ONLY. This assessment reflects cross-sectional diagnostic patterns "
    "from the clinical UCI Cleveland benchmark. It is NOT a clinical diagnosis and does NOT replace "
    "invasive angiography, 12-lead ECG, or physician consultation. If experiencing acute chest discomfort, "
    "shortness of breath, or radiating arm/jaw pain, call emergency medical services immediately."
)

SCHEMA_VERSION_CVD = "v1.0.0"


class AssessmentProvenance(BaseModel):
    """
    Provenance and Audit Metadata for Submitted Biomarkers (Task ML-S2-06)
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


class CardiovascularAssessmentRequest(BaseModel):
    """
    Input Data Contract for Task ML-CVD-01: Cardiovascular Current-Status Assessment
    Based on the 13 clinical biomarkers from the UCI Cleveland Heart Disease benchmark.
    """
    schema_version: str = Field(default=SCHEMA_VERSION_CVD, description="Schema contract version")
    provenance: AssessmentProvenance = Field(default_factory=AssessmentProvenance)

    # 1. Demographics & Symptoms
    age: int = Field(..., ge=18, le=100, description="Patient chronological age in years (18-100)")
    sex: Literal['male', 'female', 'other'] = Field(..., description="Biological sex ('male' or 'female')")
    chest_pain_type: int = Field(
        ...,
        ge=1,
        le=4,
        description="Chest pain type (1=Typical Angina, 2=Atypical Angina, 3=Non-Anginal Pain, 4=Asymptomatic)"
    )

    # 2. Hemodynamics & Biochemistry
    resting_bp: int = Field(..., ge=60, le=260, description="Resting blood pressure in mmHg upon hospital admission (60-260)")
    cholesterol: int = Field(..., ge=80, le=650, description="Serum cholesterol in mg/dL (80-650)")
    fasting_blood_sugar_gt_120: bool = Field(
        ...,
        description="Fasting blood sugar > 120 mg/dL (True if > 120 mg/dL, False otherwise)"
    )

    # 3. Electrocardiography & Exercise Stress Test
    resting_ecg: int = Field(
        ...,
        ge=0,
        le=2,
        description="Resting ECG results (0=Normal, 1=ST-T wave abnormality, 2=Left ventricular hypertrophy by Estes)"
    )
    max_heart_rate: int = Field(..., ge=50, le=250, description="Maximum heart rate achieved during exercise stress (50-250 bpm)")
    exercise_induced_angina: bool = Field(..., description="Exercise induced angina occurred during Bruce stress protocol")
    st_depression: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="ST depression induced by exercise relative to rest (0.0 to 10.0 mm)"
    )
    st_slope: int = Field(
        ...,
        ge=1,
        le=3,
        description="Slope of the peak exercise ST segment (1=Upsloping, 2=Flat, 3=Downsloping)"
    )

    # 4. Advanced Non-Invasive Diagnostics
    num_major_vessels: int = Field(
        ...,
        ge=0,
        le=3,
        description="Number of major coronary vessels (0-3) colored by fluoroscopy"
    )
    thalassemia: int = Field(
        ...,
        ge=3,
        le=7,
        description="Thallium-201 scintigraphy status (3=Normal, 6=Fixed defect, 7=Reversible defect)"
    )

    @field_validator('st_depression')
    def validate_st_depression_precision(cls, v):
        return round(float(v), 2)

    @field_validator('thalassemia')
    def validate_thal_values(cls, v):
        if v not in [3, 6, 7]:
            raise ValueError("Thalassemia value must be 3 (Normal), 6 (Fixed defect), or 7 (Reversible defect)")
        return v


class CardiovascularAssessmentResponse(BaseModel):
    """
    Output Response Contract for Task ML-CVD-01
    Follows Section 6 of SwasthyaCare_ML_Sprint_Integration_v1.0.md
    """
    task_id: str = "ML-CVD-01"
    model_id: str = "cardiovascular-current-status-rf"
    model_version: str = "1.0.0"
    assessment_status: Literal['completed', 'inconclusive', 'rejected'] = 'completed'
    prediction: int = Field(..., description="0 = No Significant Stenosis Detected, 1 = Significant Stenosis Pattern Detected")
    probability: float = Field(..., ge=0.0, le=1.0, description="Estimated class probability between 0.0 and 1.0")
    output_label: str = Field(..., description="Approved non-diagnostic label")
    contributing_factors: List[str] = Field(default_factory=list, description="Primary drivers contributing to classification")
    clinical_recommendations: List[str] = Field(default_factory=list, description="Non-directive clinical next steps")
    limitations: List[str] = Field(
        default=[
            "Educational prototype based on historical inpatient Cleveland cohort (303 records).",
            "Does NOT estimate 10-year prospective MACE risk (use Framingham ASCVD module for longitudinal risk).",
            "Not validated for emergency acute coronary syndrome (ACS) triage."
        ]
    )
    disclaimer: str = CLINICAL_DISCLAIMER_CVD
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
