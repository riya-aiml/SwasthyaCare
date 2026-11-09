from fastapi import APIRouter, HTTPException, status
from ..schemas.risk import HeartRiskRequest, HeartRiskResponse, DiabetesRiskRequest, DiabetesRiskResponse
from ..models.heart_risk import calculate_heart_risk
from ..models.diabetes_risk import calculate_diabetes_risk

router = APIRouter(prefix="/api/v1/predict", tags=["Clinical Risk Inference"])

@router.post("/heart-risk", response_model=HeartRiskResponse, status_code=status.HTTP_200_OK)
async def predict_heart_risk(payload: HeartRiskRequest):
    """
    Cardiovascular 10-Year ASCVD Risk Estimation Endpoint
    Calculates statistical risk percentage, category, contributing drivers, and guidelines.
    Includes clinical safety disclaimers.
    """
    try:
        return calculate_heart_risk(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )


@router.post("/diabetes-risk", response_model=DiabetesRiskResponse, status_code=status.HTTP_200_OK)
async def predict_diabetes_risk(payload: DiabetesRiskRequest):
    """
    Type 2 Diabetes 10-Year FINDRISC Risk Estimation Endpoint
    Calculates score (0-26), category, key drivers, and lifestyle guidance.
    Includes clinical safety disclaimers.
    """
    try:
        return calculate_diabetes_risk(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )
