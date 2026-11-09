from ..schemas.risk import DiabetesRiskRequest, DiabetesRiskResponse, CLINICAL_DISCLAIMER, MODEL_VERSION

def calculate_diabetes_risk(req: DiabetesRiskRequest) -> DiabetesRiskResponse:
    """
    Type 2 Diabetes 10-Year Risk Estimation Model
    Based on Finnish Diabetes Risk Score (FINDRISC)
    """
    score = 0
    key_drivers = []

    # 1. Age (0-4 pts)
    if req.age >= 65:
        score += 4
        key_drivers.append("Age >= 65 years")
    elif req.age >= 55:
        score += 3
        key_drivers.append("Age 55-64 years")
    elif req.age >= 45:
        score += 2

    # 2. Body Mass Index (0-3 pts)
    if req.bmi >= 30.0:
        score += 3
        key_drivers.append(f"Obesity class (BMI {req.bmi:.1f} kg/m²)")
    elif req.bmi >= 25.0:
        score += 1
        key_drivers.append(f"Overweight (BMI {req.bmi:.1f} kg/m²)")

    # 3. Waist Circumference (0-4 pts)
    if req.waist_circumference_cm >= 102:
        score += 4
        key_drivers.append(f"High abdominal adiposity ({req.waist_circumference_cm} cm)")
    elif req.waist_circumference_cm >= 94:
        score += 3
        key_drivers.append("Moderate abdominal adiposity")

    # 4. Daily Physical Activity (0-2 pts)
    if not req.daily_physical_activity:
        score += 2
        key_drivers.append("Sedentary lifestyle (< 30 min daily activity)")

    # 5. Diet (0-1 pts)
    if not req.diet_vegetables_daily:
        score += 1
        key_drivers.append("Suboptimal daily fruit/vegetable intake")

    # 6. Blood pressure history (0-2 pts)
    if req.history_high_bp:
        score += 2
        key_drivers.append("History of hypertension / anti-hypertensive use")

    # 7. Past high glucose (0-5 pts)
    if req.history_high_glucose:
        score += 5
        key_drivers.append("History of impaired fasting glucose / pre-diabetes")

    # 8. Family history (0-5 pts)
    if req.family_history_diabetes == 'first_degree':
        score += 5
        key_drivers.append("Immediate family history (parent, sibling, child)")
    elif req.family_history_diabetes == 'second_degree':
        score += 3
        key_drivers.append("Extended family history (grandparent, aunt, uncle)")

    # Map FINDRISC score to 10-year risk percentage
    if score < 7:
        category = "LOW"
        risk_pct = 1.0
    elif score <= 11:
        category = "SLIGHTLY_ELEVATED"
        risk_pct = 4.0
    elif score <= 14:
        category = "MODERATE"
        risk_pct = 17.0
    elif score <= 20:
        category = "HIGH"
        risk_pct = 33.0
    else:
        category = "VERY_HIGH"
        risk_pct = 50.0

    guidelines = [
        "Aim for a 5-7% weight reduction if overweight, which reduces diabetes risk by >58%.",
        "Engage in at least 150 minutes per week of brisk walking or moderate aerobic exercise.",
        "Consume high-fiber complex grains, legumes, and fresh green leafy vegetables daily.",
        "Undergo yearly fasting plasma glucose (FPG) and glycated hemoglobin (HbA1c) screening.",
    ]

    return DiabetesRiskResponse(
        risk_score=score,
        ten_year_risk_percentage=risk_pct,
        risk_category=category,
        key_drivers=key_drivers,
        preventive_guidelines=guidelines,
        disclaimer=CLINICAL_DISCLAIMER,
    )
