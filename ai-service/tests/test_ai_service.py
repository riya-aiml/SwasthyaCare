import os
import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import unittest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAIService(unittest.TestCase):
    def test_health_check(self):
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "SwasthyaCare AI Service")

    def test_heart_risk_prediction_valid(self):
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
        response = client.post("/api/v1/predict/heart-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("ten_year_risk_percentage", data)
        self.assertIn(data["risk_category"], ["LOW", "BORDERLINE", "INTERMEDIATE", "HIGH"])
        self.assertIn("disclaimer", data)
        self.assertIn("PRELIMINARY RISK ESTIMATE", data["disclaimer"])
        self.assertTrue(len(data["contributing_factors"]) > 0)

    def test_heart_risk_rejects_out_of_range_input(self):
        payload = {
            "age": 150,  # Invalid age
            "gender": "male",
            "systolic_bp": 140,
            "diastolic_bp": 90,
            "total_cholesterol": 200,
            "hdl_cholesterol": 50,
            "smoker": False,
            "diabetic": False,
        }
        response = client.post("/api/v1/predict/heart-risk", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_diabetes_risk_prediction(self):
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
        response = client.post("/api/v1/predict/diabetes-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["risk_score"] > 10)
        self.assertIn(data["risk_category"], ["MODERATE", "HIGH", "VERY_HIGH"])
        self.assertIn("disclaimer", data)

    def test_ocr_medicine_matching(self):
        response = client.post(
            "/api/v1/ocr/medicine",
            data={"text": "Glucophage 500mg Metformin Hydrochloride extended release tablets"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["is_inconclusive"])
        self.assertTrue(len(data["candidate_matches"]) > 0)
        top_match = data["candidate_matches"][0]
        self.assertEqual(top_match["brand_name"], "Glucophage")
        self.assertEqual(top_match["generic_name"], "Metformin Hydrochloride")
        self.assertIn("safety_advisory", data)

    def test_ocr_inconclusive_on_gibberish(self):
        response = client.post(
            "/api/v1/ocr/medicine",
            data={"text": "completely unreadable blurred text xyz123"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["is_inconclusive"])

if __name__ == "__main__":
    unittest.main()
