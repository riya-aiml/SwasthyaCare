"""
SwasthyaCare AI Service — Internal Assessment Endpoints (FastAPI)
Tasks: ML-S6-01, ML-S6-02, ML-S6-06, ML-S6-07, ML-S6-08
Exposes internal RPC endpoints for current-status decision support.
Protected by X-Internal-Service-Key authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
import logging

from app.core.security import verify_internal_rpc_key
from app.schemas.diabetes_assessment import (
    DiabetesAssessmentRequest,
    DiabetesAssessmentResponse
)
from app.schemas.cardiovascular_assessment import (
    CardiovascularAssessmentRequest,
    CardiovascularAssessmentResponse
)
from app.services.model_registry import registry

logger = logging.getLogger("swasthyacare.internal_api")

router = APIRouter(
    prefix="/internal/v1",
    tags=["Internal Machine Learning Assessments"],
    dependencies=[Depends(verify_internal_rpc_key)]
)


@router.get("/health")
async def internal_health():
    """
    Health and model readiness probe for internal service orchestrator.
    """
    is_ready = registry.is_healthy()
    return {
        "status": "operational" if is_ready else "degraded",
        "service": "SwasthyaCare AI Inference Microservice",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "models_loaded": {
            "ML-DIA-01": "ML-DIA-01" in registry.models,
            "ML-CVD-01": "ML-CVD-01" in registry.models
        },
        "metadata": {
            "ML-DIA-01": registry.metadata.get("ML-DIA-01", {}),
            "ML-CVD-01": registry.metadata.get("ML-CVD-01", {})
        }
    }


@router.post(
    "/assessments/diabetes/current-status",
    response_model=DiabetesAssessmentResponse,
    summary="Task ML-DIA-01: Diabetes Current-Status Assessment",
    description="Internal RPC: Evaluates self-reported survey indicators against CDC BRFSS benchmark."
)
async def assess_diabetes_current_status(request: DiabetesAssessmentRequest):
    """
    Executes ML-DIA-01 classification.
    """
    try:
        response = registry.predict_diabetes(request)
        return response
    except Exception as e:
        logger.error(f"Error during ML-DIA-01 inference: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INFERENCE_EXECUTION_FAILURE",
                "message": "An internal error occurred while executing the diabetes assessment model."
            }
        )


@router.post(
    "/assessments/cardiovascular/current-status",
    response_model=CardiovascularAssessmentResponse,
    summary="Task ML-CVD-01: Cardiovascular Current-Status Assessment",
    description="Internal RPC: Evaluates diagnostic biomarkers against UCI Cleveland catheterization benchmark."
)
async def assess_cardiovascular_current_status(request: CardiovascularAssessmentRequest):
    """
    Executes ML-CVD-01 classification.
    """
    try:
        response = registry.predict_cardiovascular(request)
        return response
    except Exception as e:
        logger.error(f"Error during ML-CVD-01 inference: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INFERENCE_EXECUTION_FAILURE",
                "message": "An internal error occurred while executing the cardiovascular assessment model."
            }
        )
