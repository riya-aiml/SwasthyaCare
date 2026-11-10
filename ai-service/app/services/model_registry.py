"""
SwasthyaCare AI Service — Model Registry & Inference Service
Tasks: ML-S6-01, ML-S6-02, ML-S6-03, ML-S6-04, ML-S6-05, ML-S6-06
Loads serialized pipelines on startup, executes calibrated inference,
extracts contributing clinical factors, and formats FDA SaMD compliant responses.
"""

import os
import json
import logging
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

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

logger = logging.getLogger("swasthyacare.model_registry")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "models")


class ModelRegistry:
    """
    Singleton Registry managing in-memory models, metadata, and inference pipelines.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.models: Dict[str, Any] = {}
        self.metadata: Dict[str, Dict[str, Any]] = {}
        self.load_all_models()
        self._initialized = True

    def load_all_models(self):
        """Warm-load model pipelines and metadata into memory."""
        logger.info("Initializing SwasthyaCare Model Registry...")

        # 1. Diabetes Current-Status (ML-DIA-01)
        dia_dir = os.path.join(MODELS_DIR, "ML-DIA-01")
        dia_model_path = os.path.join(dia_dir, "model_v1.0.0.joblib")
        dia_meta_path = os.path.join(dia_dir, "model_metadata.json")

        if os.path.exists(dia_model_path):
            try:
                self.models["ML-DIA-01"] = joblib.load(dia_model_path)
                with open(dia_meta_path, "r") as f:
                    self.metadata["ML-DIA-01"] = json.load(f)
                logger.info("Successfully loaded model pipeline: ML-DIA-01 (diabetes-current-status-lr v1.0.0)")
            except Exception as e:
                logger.error(f"Failed to load ML-DIA-01 model: {e}")
        else:
            logger.warning(f"Model artifact not found at: {dia_model_path}")

        # 2. Cardiovascular Current-Status (ML-CVD-01)
        cvd_dir = os.path.join(MODELS_DIR, "ML-CVD-01")
        cvd_model_path = os.path.join(cvd_dir, "model_v1.0.0.joblib")
        cvd_meta_path = os.path.join(cvd_dir, "model_metadata.json")

        if os.path.exists(cvd_model_path):
            try:
                self.models["ML-CVD-01"] = joblib.load(cvd_model_path)
                with open(cvd_meta_path, "r") as f:
                    self.metadata["ML-CVD-01"] = json.load(f)
                logger.info("Successfully loaded model pipeline: ML-CVD-01 (cardiovascular-current-status-rf v1.0.0)")
            except Exception as e:
                logger.error(f"Failed to load ML-CVD-01 model: {e}")
        else:
            logger.warning(f"Model artifact not found at: {cvd_model_path}")

    def is_healthy(self) -> bool:
        """Check if both active models are loaded and ready."""
        return "ML-DIA-01" in self.models and "ML-CVD-01" in self.models

    def predict_diabetes(self, request: DiabetesAssessmentRequest) -> DiabetesAssessmentResponse:
        """
        Execute calibrated inference for Task ML-DIA-01.
        """
        if "ML-DIA-01" not in self.models:
            raise RuntimeError("Diabetes model pipeline (ML-DIA-01) is not loaded.")

        model = self.models["ML-DIA-01"]
        meta = self.metadata.get("ML-DIA-01", {})
        threshold = meta.get("optimal_threshold", 0.49)

        # Convert request to single-row dataframe matching training pipeline
        payload = request.model_dump()
        df = pd.DataFrame([payload])

        # Predict probability
        proba_array = model.predict_proba(df)[0]
        pos_proba = round(float(proba_array[1]), 4)
        is_elevated = int(pos_proba >= threshold)

        # Identify key clinical contributing factors from patient input
        contributing_factors = []
        if request.high_bp:
            contributing_factors.append("Diagnosed hypertension (elevated systemic blood pressure)")
        if request.high_chol:
            contributing_factors.append("Diagnosed dyslipidemia (elevated blood cholesterol)")
        if request.bmi >= 25.0:
            contributing_factors.append(f"Elevated Body Mass Index (BMI: {request.bmi} kg/m² exceeds recommended thresholds)")
        elif request.bmi >= 23.0:
            contributing_factors.append(f"BMI of {request.bmi} kg/m² falls in South Asian ICMR elevated visceral adiposity range")
        if request.gen_hlth >= 3:
            contributing_factors.append(f"Self-reported general health perception rating ({request.gen_hlth}/5)")
        if request.diff_walk:
            contributing_factors.append("Reported physical difficulty walking or climbing stairs")
        if not request.phys_activity:
            contributing_factors.append("Sedentary lifestyle (no leisure physical activity reported in past 30 days)")
        if request.smoker:
            contributing_factors.append("History of smoking (>= 100 cigarettes in lifetime)")

        if not contributing_factors:
            contributing_factors.append("Baseline demographic and lifestyle indicators within standard physiological ranges")

        # Non-pharmacological lifestyle recommendations
        recommendations = [
            "Discuss metabolic indicators with your primary care physician.",
            "Consider routine fasting plasma glucose (FPG) and glycated hemoglobin (HbA1c) diagnostic laboratory testing.",
            "Engage in regular moderate aerobic exercise (aim for at least 150 minutes per week).",
            "Emphasize a balanced dietary pattern rich in leafy vegetables, dietary fiber, and complex carbohydrates."
        ]

        output_label = (
            "Reported Profile Consistent with Elevated Diabetes Indicator Pattern"
            if is_elevated
            else "Reported Profile Currently Not Indicative of Elevated Diabetes Pattern"
        )

        return DiabetesAssessmentResponse(
            task_id="ML-DIA-01",
            model_id=meta.get("model_id", "diabetes-current-status-lr"),
            model_version=meta.get("model_version", "1.0.0"),
            assessment_status="completed",
            prediction=is_elevated,
            probability=pos_proba,
            output_label=output_label,
            contributing_factors=contributing_factors,
            lifestyle_recommendations=recommendations,
            disclaimer=CLINICAL_DISCLAIMER_DIABETES
        )

    def predict_cardiovascular(self, request: CardiovascularAssessmentRequest) -> CardiovascularAssessmentResponse:
        """
        Execute calibrated inference for Task ML-CVD-01.
        """
        if "ML-CVD-01" not in self.models:
            raise RuntimeError("Cardiovascular model pipeline (ML-CVD-01) is not loaded.")

        model = self.models["ML-CVD-01"]
        meta = self.metadata.get("ML-CVD-01", {})
        threshold = meta.get("optimal_threshold", 0.55)

        payload = request.model_dump()
        df = pd.DataFrame([payload])

        proba_array = model.predict_proba(df)[0]
        pos_proba = round(float(proba_array[1]), 4)
        is_suggestive = int(pos_proba >= threshold)

        # Identify key clinical contributing factors from patient input
        contributing_factors = []
        if request.thalassemia in [6, 7]:
            defect_type = "Fixed defect" if request.thalassemia == 6 else "Reversible defect"
            contributing_factors.append(f"Thallium-201 nuclear scintigraphy shows {defect_type} (perfusion abnormality)")
        if request.num_major_vessels > 0:
            contributing_factors.append(f"Fluoroscopy demonstrates {request.num_major_vessels} major coronary vessels with visible narrowing")
        if request.st_depression >= 1.0:
            contributing_factors.append(f"Exercise-induced ST depression of {request.st_depression} mm indicates subendocardial ischemia")
        if request.exercise_induced_angina:
            contributing_factors.append("Exercise-induced angina manifested during Bruce stress protocol")
        if request.max_heart_rate < 140:
            contributing_factors.append(f"Peak exercise heart rate of {request.max_heart_rate} bpm indicates chronotropic limitation")
        if request.resting_bp >= 140:
            contributing_factors.append(f"Resting systolic blood pressure ({request.resting_bp} mmHg) meets Stage 2 hypertension criteria")
        if request.cholesterol >= 240:
            contributing_factors.append(f"Total serum cholesterol ({request.cholesterol} mg/dL) indicates hypercholesterolemia")
        if request.chest_pain_type == 4:
            contributing_factors.append("Asymptomatic presentation (often associated with silent ischemia in CAD referrals)")

        if not contributing_factors:
            contributing_factors.append("Resting hemodynamics and exercise parameters within standard diagnostic limits")

        recommendations = [
            "Review diagnostic findings with a board-certified cardiologist.",
            "Consider a comprehensive 12-lead resting electrocardiogram (ECG) and transthoracic echocardiogram (TTE).",
            "Optimize modifiable cardiovascular risk factors: maintain target blood pressure and lipid goals.",
            "WARNING: If experiencing acute chest tightness, radiating pain to the jaw/arm, or acute shortness of breath, call emergency services immediately."
        ]

        output_label = (
            "Biomarker Pattern Suggestive of Significant Coronary Stenosis Pattern"
            if is_suggestive
            else "Biomarker Pattern Not Indicative of Significant Coronary Stenosis"
        )

        return CardiovascularAssessmentResponse(
            task_id="ML-CVD-01",
            model_id=meta.get("model_id", "cardiovascular-current-status-rf"),
            model_version=meta.get("model_version", "1.0.0"),
            assessment_status="completed",
            prediction=is_suggestive,
            probability=pos_proba,
            output_label=output_label,
            contributing_factors=contributing_factors,
            clinical_recommendations=recommendations,
            disclaimer=CLINICAL_DISCLAIMER_CVD
        )


# Global singleton instance
registry = ModelRegistry()
