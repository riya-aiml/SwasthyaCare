# Sprint 4 — Implementation Summary
## Machine Learning Current-Status Baselines & Evaluation

**Document ID:** SWC-ML-S4-SUM  
**Sprint:** Sprint 4 — Diabetes and Cardiovascular Current-Status Baselines  
**Parent Roadmap:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Status:** ✅ COMPLETE  
**Date Completed:** 2026-11-10  
**Project:** SwasthyaCare — AI-Assisted Clinical Workflow & Disease Prediction System  

---

## 🎯 Sprint Goal
Train transparent, reproducible baseline models for both active current-status tasks (`ML-DIA-01` and `ML-CVD-01`) using approved benchmarks, compare linear (Logistic Regression) vs. tree-based (Random Forest) models, execute comprehensive statistical evaluation (ROC-AUC, PR-AUC, Sensitivity, Specificity, Precision, F1-Score, Brier Score), calibrate decision thresholds, and serialize production-ready model pipelines and metadata into `ai-service/models/`.

---

## ✅ Tasks Completed

| Task ID | Task Description | Priority | Status | Output Deliverable |
|:---:|---|:---:|:---:|---|
| **ML-S4-01** | Build diabetes current-status baseline | Must | ✅ Done | Logistic Regression baseline with balanced class weights (`ai-service/models/ML-DIA-01/model_v1.0.0.joblib`) |
| **ML-S4-02** | Compare diabetes tree-based model | Should | ✅ Done | Random Forest Classifier comparison evaluated on test partition |
| **ML-S4-03** | Build cardiovascular current-status baseline | Must | ✅ Done | Logistic Regression linear baseline on Cleveland catheterization data |
| **ML-S4-04** | Compare cardiovascular tree-based model | Should | ✅ Done | Random Forest ensemble (`ai-service/models/ML-CVD-01/model_v1.0.0.joblib`) |
| **ML-S4-05** | Evaluate each model comprehensively | Must | ✅ Done | [`Docs/ml/baseline_models_evaluation.md`](../ml/baseline_models_evaluation.md) & [`ai-service/training/reports/baseline_evaluation_report.json`](../../ai-service/training/reports/baseline_evaluation_report.json) |
| **ML-S4-06** | Review calibration and threshold choices | Must | ✅ Done | Optimal operating thresholds selected ($\tau=0.49$ for Diabetes; $\tau=0.55$ for Cardiovascular) |
| **ML-S4-07** | Save experiment metadata and model artifacts | Must | ✅ Done | Serialized `.joblib` pipelines and JSON metadata cards saved in `ai-service/models/` |

---

## 📊 Summary of Baseline Model Performance

### 1. Task ML-DIA-01 (Diabetes Current-Status Assessment)
* **Dataset:** CDC BRFSS 2015 Benchmark ($N_{\text{train}} = 7,985$, $N_{\text{test}} = 1,997$).
* **Primary Model:** Logistic Regression (`diabetes-current-status-lr`).
* **Test Metrics:**
  * **ROC-AUC:** `0.8292`
  * **PR-AUC:** `0.4291` ($>3\times$ above baseline prevalence)
  * **Sensitivity (Recall):** `78.97%` (captures $\approx 8$ of 10 cases)
  * **Specificity:** `71.09%`
  * **F1-Score:** `0.4350`
  * **Brier Score:** `0.1779`
  * **Calibrated Decision Threshold:** `0.49`

### 2. Task ML-CVD-01 (Cardiovascular Current-Status Assessment)
* **Dataset:** UCI Cleveland Clinic Catheterization Benchmark ($N_{\text{train}} = 242$, $N_{\text{test}} = 61$).
* **Primary Model:** Random Forest Ensemble (`cardiovascular-current-status-rf`).
* **Test Metrics:**
  * **ROC-AUC:** `0.9675`
  * **PR-AUC:** `0.9562`
  * **Sensitivity (Recall):** `92.86%` (only 2 false negatives out of 28 positive cases)
  * **Specificity:** `93.94%` (only 2 false alarms out of 33 negative cases)
  * **F1-Score:** `0.9286`
  * **Brier Score:** `0.0764`
  * **Calibrated Decision Threshold:** `0.55`

---

## 🧪 Automated Testing & Verification

1. **Python AI Service Tests (`pytest`):**
   * Unit tests added in [`ai-service/tests/test_sprint4_baseline_models.py`](../../ai-service/tests/test_sprint4_baseline_models.py).
   * Verified model loading, feature transformations, prediction probability outputs, and disclaimer integration.
   * Total test execution: **17/17 tests passing** in 1.29s.
2. **Platform Zero-Regression Verification:**
   * Backend Node.js tests: **12/12 passing** (`server/tests/sprint8.test.js`).
3. **Artifact Integrity:**
   * Model files tested with single-record payloads matching the Pydantic contracts.

---

## ⏭️ Ready for Sprint 5
All **Definition of Done (DoD)** criteria for Sprint 4 have been satisfied.
* **Sprint 5 Objective:** Model comparison & calibration review, subgroup/fairness analysis, model cards documentation (`ML-DIA-01` and `ML-CVD-01`), and formal sign-off on future-risk feasibility decisions (`ML-S5-01` to `ML-S5-08`).
