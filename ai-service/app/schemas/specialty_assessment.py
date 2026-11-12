"""
SwasthyaCare AI Service — Medical Department Specialty Schemas
Task: ML-DEP-01
Pydantic schemas for request and response contracts for the
Classical ML Medical Specialty Classifier.
"""

from typing import Dict, Optional
from pydantic import BaseModel, Field


class DepartmentPredictionRequest(BaseModel):
    symptoms: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Patient clinical symptoms description in free-text English or Hinglish.",
        examples=["Severe knee pain and morning joint stiffness when walking."]
    )


class DepartmentPredictionResponse(BaseModel):
    predicted_department: str = Field(..., description="Hospital OPD clinical specialty department.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Calibrated classification probability.")
    all_probabilities: Dict[str, float] = Field(..., description="Probability distribution across all 8 departments.")
    model_version: str = Field(default="1.0.0", description="Model artifact version.")
    model_task_id: str = Field(default="ML-DEP-01", description="Registered model task ID.")
    latency_ms: float = Field(..., description="Inference latency in milliseconds.")
    status: str = Field(default="success")
