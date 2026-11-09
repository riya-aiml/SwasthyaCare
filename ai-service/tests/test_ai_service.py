import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SwasthyaCare AI Service"

@pytest.mark.asyncio
async def test_heart_risk_prediction_valid():
    payload = {
        "age": 55,
        "gender": "male",
        "systolic_bp": 145,
        "diastolic_bp": 90,
        "total_cholesterol": 230,
        "hdl_cholesterol": 42,
        "smoker": True,
        "diabetic": False,
        "on_bp_medication": True,
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/predict/heart-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ten_year_risk_percentage" in data
    assert data["risk_category"] in ["LOW", "BORDERLINE", "INTERMEDIATE", "HIGH"]
    assert "disclaimer" in data
    assert "PRELIMINARY RISK ESTIMATE" in data["disclaimer"]
    assert len(data["contributing_factors"]) > 0

@pytest.mark.asyncio
async def test_heart_risk_rejects_out_of_range_input():
    # Age 150 is out of valid range (18-100)
    payload = {
        "age": 150,
        "gender": "male",
        "systolic_bp": 140,
        "diastolic_bp": 90,
        "total_cholesterol": 200,
        "hdl_cholesterol": 50,
        "smoker": False,
        "diabetic": False,
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/predict/heart-risk", json=payload)
    assert response.status_code == 422  # Pydantic validation error

@pytest.mark.asyncio
async def test_diabetes_risk_prediction():
    payload = {
        "age": 58,
        "bmi": 29.5,
        "waist_circumference_cm": 98.0,
        "daily_physical_activity": False,
        "diet_vegetables_daily": True,
        "history_high_bp": True,
        "history_high_glucose": True,
        "family_history_diabetes": "first_degree",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/predict/diabetes-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] > 10
    assert data["risk_category"] in ["MODERATE", "HIGH", "VERY_HIGH"]
    assert "disclaimer" in data

@pytest.mark.asyncio
async def test_ocr_medicine_matching():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/ocr/medicine",
            data={"text": "Glucophage 500mg Metformin Hydrochloride extended release tablets"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["is_inconclusive"] is False
    assert len(data["candidate_matches"]) > 0
    top_match = data["candidate_matches"][0]
    assert top_match["brand_name"] == "Glucophage"
    assert top_match["generic_name"] == "Metformin Hydrochloride"
    assert "safety_advisory" in data

@pytest.mark.asyncio
async def test_ocr_inconclusive_on_gibberish():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/ocr/medicine",
            data={"text": "completely unreadable blurred text xyz123"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["is_inconclusive"] is True
