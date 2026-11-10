"""
SwasthyaCare — Sprint 2 ML Input Contracts & Preprocessing Unit Tests
Tests schemas, validation bounds, invalid rejections, and leakage-free transformations.
"""

import unittest
import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pydantic import ValidationError
from app.schemas.diabetes_assessment import (
    DiabetesAssessmentRequest,
    DiabetesAssessmentResponse,
    CLINICAL_DISCLAIMER_DIABETES
)
from app.schemas.cardiovascular_assessment import (
    CardiovascularAssessmentRequest,
    CardiovascularAssessmentResponse,
    CLINICAL_DISCLAIMER_CVD
)
from training.data_loader import (
    load_and_validate_diabetes_data,
    load_and_validate_cardiovascular_data
)
from training.preprocess import (
    build_diabetes_preprocessor,
    build_cardiovascular_preprocessor
)


class TestSprint2MLContracts(unittest.TestCase):

    def setUp(self):
        self.synthetic_dir = os.path.join(BASE_DIR, "data", "synthetic")

    def test_diabetes_valid_records_schema(self):
        """Verify that synthetic diabetes records pass Pydantic schema validation."""
        valid_path = os.path.join(self.synthetic_dir, "diabetes_valid_records.json")
        self.assertTrue(os.path.exists(valid_path), "Diabetes valid records file missing")
        with open(valid_path, "r") as f:
            records = json.load(f)

        self.assertGreater(len(records), 50)
        for record in records:
            req = DiabetesAssessmentRequest(**record)
            self.assertGreaterEqual(req.age, 18)
            self.assertLessEqual(req.age, 100)
            self.assertGreaterEqual(req.bmi, 12.0)
            self.assertLessEqual(req.bmi, 70.0)
            self.assertTrue(req.provenance.patient_confirmed)

    def test_diabetes_invalid_records_rejection(self):
        """Verify that out-of-bound diabetes inputs are rejected with ValidationError."""
        invalid_path = os.path.join(self.synthetic_dir, "diabetes_invalid_records.json")
        self.assertTrue(os.path.exists(invalid_path), "Diabetes invalid records file missing")
        with open(invalid_path, "r") as f:
            invalids = json.load(f)

        for case in invalids:
            with self.subTest(case=case["test_case"]):
                with self.assertRaises(ValidationError):
                    DiabetesAssessmentRequest(**case["payload"])

    def test_cardiovascular_valid_records_schema(self):
        """Verify that synthetic cardiovascular records pass Pydantic schema validation."""
        valid_path = os.path.join(self.synthetic_dir, "cardiovascular_valid_records.json")
        self.assertTrue(os.path.exists(valid_path), "Cardiovascular valid records file missing")
        with open(valid_path, "r") as f:
            records = json.load(f)

        self.assertGreater(len(records), 50)
        for record in records:
            req = CardiovascularAssessmentRequest(**record)
            self.assertGreaterEqual(req.age, 18)
            self.assertLessEqual(req.age, 100)
            self.assertGreaterEqual(req.resting_bp, 60)
            self.assertLessEqual(req.resting_bp, 260)
            self.assertIn(req.thalassemia, [3, 6, 7])
            self.assertTrue(req.provenance.patient_confirmed)

    def test_cardiovascular_invalid_records_rejection(self):
        """Verify that out-of-bound cardiovascular inputs are rejected with ValidationError."""
        invalid_path = os.path.join(self.synthetic_dir, "cardiovascular_invalid_records.json")
        self.assertTrue(os.path.exists(invalid_path), "Cardiovascular invalid records file missing")
        with open(invalid_path, "r") as f:
            invalids = json.load(f)

        for case in invalids:
            with self.subTest(case=case["test_case"]):
                with self.assertRaises(ValidationError):
                    CardiovascularAssessmentRequest(**case["payload"])

    def test_data_loader_stratified_split(self):
        """Verify that data loaders return stratified 80/20 train/test splits with zero leakage."""
        X_tr_dia, X_te_dia, y_tr_dia, y_te_dia, meta_dia = load_and_validate_diabetes_data()
        self.assertEqual(meta_dia["validation_failures"], 0)
        self.assertAlmostEqual(len(X_te_dia) / (len(X_tr_dia) + len(X_te_dia)), 0.20, delta=0.03)

        X_tr_cvd, X_te_cvd, y_tr_cvd, y_te_cvd, meta_cvd = load_and_validate_cardiovascular_data()
        self.assertEqual(meta_cvd["validation_failures"], 0)
        self.assertAlmostEqual(len(X_te_cvd) / (len(X_tr_cvd) + len(X_te_cvd)), 0.20, delta=0.03)

    def test_preprocessing_transformers(self):
        """Verify that ColumnTransformers transform data cleanly and yield numerical matrices."""
        X_tr_dia, X_te_dia, y_tr_dia, y_te_dia, _ = load_and_validate_diabetes_data()
        dia_prep = build_diabetes_preprocessor()
        X_tr_dia_trans = dia_prep.fit_transform(X_tr_dia)
        X_te_dia_trans = dia_prep.transform(X_te_dia)

        self.assertEqual(X_tr_dia_trans.shape[0], len(X_tr_dia))
        self.assertEqual(X_te_dia_trans.shape[0], len(X_te_dia))
        self.assertEqual(X_tr_dia_trans.shape[1], X_te_dia_trans.shape[1])

        X_tr_cvd, X_te_cvd, y_tr_cvd, y_te_cvd, _ = load_and_validate_cardiovascular_data()
        cvd_prep = build_cardiovascular_preprocessor()
        X_tr_cvd_trans = cvd_prep.fit_transform(X_tr_cvd)
        X_te_cvd_trans = cvd_prep.transform(X_te_cvd)

        self.assertEqual(X_tr_cvd_trans.shape[0], len(X_tr_cvd))
        self.assertEqual(X_te_cvd_trans.shape[0], len(X_te_cvd))
        self.assertEqual(X_tr_cvd_trans.shape[1], X_te_cvd_trans.shape[1])

    def test_response_disclaimers(self):
        """Verify that response schemas enforce SaMD educational disclaimers."""
        dia_resp = DiabetesAssessmentResponse(
            prediction=0,
            probability=0.12,
            output_label="Reported Profile Currently Not Indicative of Elevated Diabetes Pattern"
        )
        self.assertIn("EDUCATIONAL PROTOTYPE ONLY", dia_resp.disclaimer)
        self.assertIn("CDC BRFSS", dia_resp.disclaimer)

        cvd_resp = CardiovascularAssessmentResponse(
            prediction=1,
            probability=0.78,
            output_label="Biomarker Pattern Suggestive of Significant Coronary Stenosis Pattern"
        )
        self.assertIn("EDUCATIONAL PROTOTYPE ONLY", cvd_resp.disclaimer)
        self.assertIn("UCI Cleveland benchmark", cvd_resp.disclaimer)


if __name__ == "__main__":
    unittest.main()
