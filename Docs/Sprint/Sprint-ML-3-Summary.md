# Sprint 3 — Implementation Summary
## Machine Learning Dataset Audit & Exploratory Data Analysis (EDA)

**Document ID:** SWC-ML-S3-SUM  
**Sprint:** Sprint 3 — Dataset Audit and Exploratory Analysis  
**Parent Roadmap:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Status:** ✅ COMPLETE  
**Date Completed:** 2026-11-10  
**Project:** SwasthyaCare — AI-Assisted Clinical Workflow & Disease Prediction System  

---

## 🎯 Sprint Goal
Determine whether candidate datasets support the intended prediction targets, execute quantitative Exploratory Data Analysis (EDA), profile missingness and duplicates, analyze class imbalances and demographic biases (especially South Asian / Indian premature CAD onset and lower BMI thresholds), conduct data leakage reviews, deliver evidence-based go/no-go decisions for prospective future-risk tasks, and serialize reproducible preprocessors for downstream model training.

---

## ✅ Tasks Completed

| Task ID | Task Description | Priority | Status | Output Deliverable |
|:---:|---|:---:|:---:|---|
| **ML-S3-01** | Audit candidate diabetes datasets | Must | ✅ Done | [`Docs/ml/dataset_audit_diabetes.md`](../ml/dataset_audit_diabetes.md) & [`ai-service/training/reports/dataset_eda_audit_report.json`](../../ai-service/training/reports/dataset_eda_audit_report.json) |
| **ML-S3-02** | Audit candidate cardiovascular datasets | Must | ✅ Done | [`Docs/ml/dataset_audit_cardiovascular.md`](../ml/dataset_audit_cardiovascular.md) & [`ai-service/training/reports/dataset_eda_audit_report.json`](../../ai-service/training/reports/dataset_eda_audit_report.json) |
| **ML-S3-03** | Check missingness, duplicates and data quality | Must | ✅ Done | [`Docs/ml/eda_and_data_quality_report.md`](../ml/eda_and_data_quality_report.md) |
| **ML-S3-04** | Check class balance and feature distributions | Must | ✅ Done | [`Docs/ml/eda_and_data_quality_report.md`](../ml/eda_and_data_quality_report.md) |
| **ML-S3-05** | Identify leakage and inappropriate predictors | Must | ✅ Done | [`Docs/ml/leakage_review_and_excluded_features.md`](../ml/leakage_review_and_excluded_features.md) |
| **ML-S3-06** | Evaluate future-risk data suitability & gating | Must | ✅ Done | [`Docs/ml/future_risk_feasibility_decision.md`](../ml/future_risk_feasibility_decision.md) |
| **ML-S3-07** | Create reproducible preprocessing pipeline | Should | ✅ Done | [`ai-service/training/preprocess.py`](../../ai-service/training/preprocess.py) & `ai-service/models/*/preprocessor_v1.0.0.joblib` |

---

## 📊 Quantitative Audit Findings

### 1. Diabetes Domain (`ML-DIA-01` & `ML-DIA-02`)
* **Primary Benchmark:** CDC BRFSS 2015 (`UCI #891`) — **253,680 instances, 21 features**.
  * **Ground Truth:** Self-reported physician diagnosis of diabetes/prediabetes.
  * **Class Distribution:** $86.07\%$ Negative ($218,334$), $13.93\%$ Positive ($35,346$) $\rightarrow$ **6.18 : 1 imbalance**.
  * **Missingness:** **0 missing values (0.00%)**.
  * **Duplicates:** 24,206 duplicate rows ($9.54\%$), clinically explained by low-cardinality telephone survey response clustering.
  * **Top Predictors:** `GenHlth` ($r=+0.294$), `HighBP` ($r=+0.263$), `DiffWalk` ($r=+0.218$), `BMI` ($r=+0.217$).
* **Pima Indians Evaluation:** 768 instances. **REJECTED** for general Indian outpatient screening due to genetic homogeneity and biological anomalies (374 zeros in insulin, 227 zeros in triceps skinfold).
* **Future-Risk Feasibility (`ML-DIA-02`):** **GATED / DEFERRED**. Cross-sectional survey data cannot model prospective 5-year incident disease onset.

### 2. Cardiovascular Domain (`ML-CVD-01` & `ML-CVD-02`)
* **Primary Benchmark:** UCI Cleveland Clinic (`UCI #45`) — **303 instances, 13 features**.
  * **Ground Truth:** Fluoroscopic angiography: $\ge 50\%$ diameter stenosis in $\ge 1$ major coronary artery.
  * **Class Distribution:** $54.13\%$ Negative ($164$), $45.87\%$ Positive ($139$) $\rightarrow$ **1.18 : 1 balanced**.
  * **Missingness:** 6 total missing values (4 in `ca`, 2 in `thal`), imputed via median/mode on $D_{\text{train}}$.
  * **Demographics:** Mean age 54.4 yrs; 68.0% male, 32.0% female.
  * **Top Stenosis Correlates:** `thal` ($r=+0.526$), `ca` ($r=+0.460$), `exang` ($r=+0.432$), `oldpeak` ($r=+0.425$), `cp` ($r=+0.414$).
* **Future-Risk Feasibility (`ML-CVD-02`):** **GATED / DEFERRED**. Inpatient catheterization snapshot cannot model 10-year MACE. Platform's existing peer-reviewed Framingham ASCVD Cox regression engine (Sprint 6) continues serving prospective risk support.

---

## 🇮🇳 Demographic & Clinical Bias Documentation (Indian Context)

1. **Premature CAD Onset in South Asians:**
   * Western historical benchmarks diagnose CAD at mean age 54.4 years.
   * In India, CAD manifests 5–10 years earlier, with $>50\%$ of CAD mortalities occurring under age 50. UI includes an explicit clinical note advising early screening.
2. **BMI Visceral Obesity Thresholds:**
   * WHO South Asian guidelines classify overweight at $\text{BMI} \ge 23\text{ kg/m}^2$ and obesity at $\ge 25\text{ kg/m}^2$ (vs $\ge 25$ and $\ge 30$ in Western cohorts).
   * Patient educational cards highlight South Asian visceral adiposity reference ranges.

---

## 🧪 Pipeline & Preprocessor Artifacts Produced

* Preprocessors fitted on $D_{\text{train}}$ and serialized via `joblib`:
  * `ai-service/models/ML-DIA-01/preprocessor_v1.0.0.joblib`
  * `ai-service/models/ML-DIA-01/preprocessor_metadata.json`
  * `ai-service/models/ML-CVD-01/preprocessor_v1.0.0.joblib`
  * `ai-service/models/ML-CVD-01/preprocessor_metadata.json`
* Automated test suite executed: **13/13 passing** with zero platform regressions.

---

## ⏭️ Ready for Sprint 4
All **Definition of Done (DoD)** criteria for Sprint 3 have been satisfied.
* **Sprint 4 Objective:** Build and compare transparent baseline models for current-status tasks (`ML-DIA-01` and `ML-CVD-01`) using Logistic Regression and Random Forest/Gradient Boosting, evaluate calibration, select operating thresholds, and serialize model artifacts (`ML-S4-01` to `ML-S4-07`).
