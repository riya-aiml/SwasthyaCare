"""
SwasthyaCare AI Service — Assessment Schemas
Exports validated Pydantic models for ML-DIA-01 and ML-CVD-01
"""

from .diabetes_assessment import (
    DiabetesAssessmentRequest,
    DiabetesAssessmentResponse,
    AssessmentProvenance as DiabetesProvenance,
    CLINICAL_DISCLAIMER_DIABETES,
    SCHEMA_VERSION_DIABETES
)

from .cardiovascular_assessment import (
    CardiovascularAssessmentRequest,
    CardiovascularAssessmentResponse,
    AssessmentProvenance as CardiovascularProvenance,
    CLINICAL_DISCLAIMER_CVD,
    SCHEMA_VERSION_CVD
)

__all__ = [
    "DiabetesAssessmentRequest",
    "DiabetesAssessmentResponse",
    "DiabetesProvenance",
    "CLINICAL_DISCLAIMER_DIABETES",
    "SCHEMA_VERSION_DIABETES",
    "CardiovascularAssessmentRequest",
    "CardiovascularAssessmentResponse",
    "CardiovascularProvenance",
    "CLINICAL_DISCLAIMER_CVD",
    "SCHEMA_VERSION_CVD",
]
