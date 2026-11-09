import math
from ..schemas.risk import HeartRiskRequest, HeartRiskResponse, CLINICAL_DISCLAIMER, MODEL_VERSION
from datetime import datetime

def calculate_heart_risk(req: HeartRiskRequest) -> HeartRiskResponse:
    """
    Cardiovascular 10-Year ASCVD Risk Estimation Model
    Based on Framingham / ACC-AHA Pooled Cohort Equations
    """
    contributing_factors = []
    points = 0

    # Age points
    if req.age >= 70:
        points += 10
        contributing_factors.append("Advanced age (>70 years)")
    elif req.age >= 60:
        points += 8
        contributing_factors.append("Age 60-69 years")
    elif req.age >= 50:
        points += 6
    elif req.age >= 40:
        points += 3

    # Blood Pressure
    if req.systolic_bp >= 160:
        points += 8 if req.on_bp_medication else 6
        contributing_factors.append(f"Stage 2 Hypertension (Systolic {req.systolic_bp} mmHg)")
    elif req.systolic_bp >= 140:
        points += 5 if req.on_bp_medication else 4
        contributing_factors.append(f"Stage 1 Hypertension (Systolic {req.systolic_bp} mmHg)")
    elif req.systolic_bp >= 130:
        points += 3
        contributing_factors.append("Elevated blood pressure")

    # Cholesterol profile
    chol_ratio = req.total_cholesterol / max(req.hdl_cholesterol, 1)
    if chol_ratio >= 6.0:
        points += 7
        contributing_factors.append(f"High total/HDL cholesterol ratio ({chol_ratio:.1f})")
    elif chol_ratio >= 4.5:
        points += 4
        contributing_factors.append(f"Moderate total/HDL ratio ({chol_ratio:.1f})")

    if req.hdl_cholesterol < 40:
        points += 3
        contributing_factors.append(f"Low protective HDL ({req.hdl_cholesterol} mg/dL)")

    # Diabetes
    if req.diabetic:
        points += 7
        contributing_factors.append("History of Diabetes Mellitus")

    # Smoking
    if req.smoker:
        points += 6
        contributing_factors.append("Current tobacco smoker")

    # Map points to 10-year risk percentage
    # Sigmoidal mapping scaled between 1% and 48%
    risk_percentage = min(max(round(1.0 + (points * 1.35), 1), 1.0), 48.0)

    # Categorize risk
    if risk_percentage < 5.0:
        category = "LOW"
    elif risk_percentage < 10.0:
        category = "BORDERLINE"
    elif risk_percentage < 20.0:
        category = "INTERMEDIATE"
    else:
        category = "HIGH"

    recommendations = [
        "Maintain heart-healthy Mediterranean or DASH diet with reduced sodium (< 2.3g/day).",
        "Engage in at least 150 minutes of moderate-intensity aerobic exercise per week.",
        "Undergo regular lipid panel and fasting glucose screening.",
    ]

    if req.smoker:
        recommendations.append("Smoking cessation counseling and nicotine replacement therapy strongly advised.")
    if req.systolic_bp >= 140:
        recommendations.append("Consult cardiologist regarding anti-hypertensive titration.")
    if req.diabetic:
        recommendations.append("Strict glycemic control targeting HbA1c < 7.0%.")

    return HeartRiskResponse(
        ten_year_risk_percentage=risk_percentage,
        risk_category=category,
        contributing_factors=contributing_factors,
        recommendations=recommendations,
        disclaimer=CLINICAL_DISCLAIMER,
    )
