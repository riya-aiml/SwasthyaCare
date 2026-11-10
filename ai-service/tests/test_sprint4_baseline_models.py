"""
SwasthyaCare — Sprint 4 Model Artifact & Baseline Prediction Unit Tests
Verifies that serialized models load, execute, and yield valid probabilities and predictions.
"""

import unittest
import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.schemas.diabetes_assessment import DiabetesAssessmentRequest, DiabetesAssessmentResponse
from app.schemas.cardiovascular_assessment import CardiovascularAssessmentRequest, CardiovascularAssessmentResponse


class TestSprint4BaselineModels(unittest.TestCase):

    def setUp(self):
        self.models_dir = os.path.join(BASE_DIR, "models")
        self.dia_model_path = os.path.join(self.models_dir, "ML-DIA-01", "model_v1.0.0.joblib")
        self.cvd_model_path = os.path.join(self.models_dir, "ML-CVD-01", "model_v1.0.0.joblib")

    def test_dia_model_exists_and_loads(self):
        """Verify Diabetes model artifact exists and loads with joblib."""
        self.assertTrue(os.path.exists(self.dia_model_path), f"Missing: {self.dia_model_path}")
        model = joblib.load(self.dia_model_path)
        self.assertIsNotNone(model)
        self.assertTrue(hasattr(model, "predict_proba"))

    def test_cvd_model_exists_and_loads(self):
        """Verify Cardiovascular model artifact exists and loads with joblib."""
        self.assertTrue(os.path.exists(self.cvd_model_path), f"Missing: {self.cvd_model_path}")
        model = joblib.load(self.cvd_model_path)
        self.assertIsNotNone(model)
        self.assertTrue(hasattr(model, "predict_proba"))

    def test_dia_inference_pipeline_execution(self):
        """Test inference on synthetic diabetes patient record."""
        model = joblib.load(self.dia_model_path)
        sample_dict = {
            "age": 55,
            "sex": "male",
            "bmi": 31.4,
            "high_bp": True,
            "high_chol": True,
            "chol_check_5yr": True,
            "stroke_history": False,
            "heart_disease_or_attack": False,
            "smoker": True,
            "phys_activity": False,
            "fruits_daily": False,
            "veggies_daily": True,
            "heavy_alcohol": False,
            "gen_hlth": 4,
            "ment_hlth_days": 5,
            "phys_hlth_days": 10,
            "diff_walk": True,
            "any_healthcare": True,
            "no_doc_bc_cost": False,
            "education_level": 4,
            "income_level": 5
        }
        # Validate through schema first
        req = DiabetesAssessmentRequest(**sample_dict)
        df = pd.DataFrame([req.model_dump()])

        probabilities = model.predict_proba(df)[0]
        self.assertEqual(len(probabilities), 2)
        pos_prob = probabilities[1]
        self.assertGreaterEqual(pos_prob, 0.0)
        self.assertLessEqual(pos_prob, 1.0)

        # High risk factors should yield substantial positive probability
        self.assertGreater(pos_prob, 0.40)

        response = DiabetesAssessmentResponse(
            prediction=int(pos_prob >= 0.49),
            probability=round(float(pos_prob), 4),
            output_label="Reported Profile Consistent with Elevated Diabetes Indicator Pattern" if pos_prob >= 0.49 else "Reported Profile Currently Not Indicative of Elevated Diabetes Pattern"
        )
        self.assertEqual(response.task_id, "ML-DIA-01")
        self.assertIn("EDUCATIONAL PROTOTYPE", response.disclaimer)

    def test_cvd_inference_pipeline_execution(self):
        """Test inference on synthetic cardiovascular patient record."""
        model = joblib.load(self.cvd_model_path)
        sample_dict = {
            "age": 63,
            "sex": "male",
            "chest_pain_type": 4,  # Asymptomatic
            "resting_bp": 145,
            "cholesterol": 233,
            "fasting_blood_sugar_gt_120": True,
            "resting_ecg": 2,
            "max_heart_rate": 150,
            "exercise_induced_angina": False,
            "st_depression": 2.3,
            "st_slope": 3,
            "num_major_vessels": 0,
            "thalassemia": 6
        }
        req = CardiovascularAssessmentRequest(**sample_dict)
        df = pd.DataFrame([req.model_dump()])

        probabilities = model.predict_proba(df)[0]
        self.assertEqual(len(probabilities), 2)
        pos_prob = probabilities[1]
        self.assertGreaterEqual(pos_prob, 0.0)
        self.assertLessEqual(pos_prob, 1.0)

        response = CardiovascularAssessmentResponse(
            prediction=int(pos_prob >= 0.55),
            probability=round(float(pos_prob), 4),
            output_label="Biomarker Pattern Suggestive of Significant Coronary Stenosis Pattern" if pos_prob >= 0.55 else "Biomarker Pattern Not Indicative of Significant Coronary Stenosis"
        )
        self.assertEqual(response.task_id, "ML-CVD-01")
        self.assertIn("EDUCATIONAL PROTOTYPE", response.disclaimer)


if __name__ == "__main__":
    unittest.main()
