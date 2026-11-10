# ML Sprint 1 — Implementation Summary
## Problem Definition, Dataset Acquisition & Statistical Audit

**Sprint ID:** ML Sprint 1 — Disease Prediction & Dataset Audit  
**Status:** ✅ COMPLETE  
**Date Completed:** 2026-11-10  
**Project:** SwasthyaCare — AI-Assisted Clinical Workflow & Disease Prediction System  
**Lead Framework:** Agile Scrum (as per `Docs/Sprint/SwasthyaCare_ML_Agile.md`)  

---

## 🎯 Sprint Goal
Precisely define what each model predicts, acquire and audit the benchmark medical datasets, document feature definitions and units, and establish explicit clinical safety boundaries and approved user-facing wording before model training begins.

---

## ✅ Sprint Tasks Completed

| Task ID | Task Description | Priority | Status | Output Artifact |
|---|---|:---:|:---:|---|
| **ML1-01** | Cardiovascular classification problem statement | Must | ✅ Done | [`Docs/ml/problem_definitions.md`](../ml/problem_definitions.md) |
| **ML1-02** | Diabetes classification problem statement | Must | ✅ Done | [`Docs/ml/problem_definitions.md`](../ml/problem_definitions.md) |
| **ML1-03** | Download official dataset files & documentation | Must | ✅ Done | `ai-service/data/cardiovascular/` & `ai-service/data/diabetes/` |
| **ML1-04** | Review dataset licenses & permitted use | Must | ✅ Done | CC BY 4.0 (Heart Disease) & CC0 Public Domain (CDC BRFSS) |
| **ML1-05** | Inspect shape, data types, and target labels | Must | ✅ Done | [`Docs/ml/dataset_audit_metrics.json`](../ml/dataset_audit_metrics.json) |
| **ML1-06** | Create comprehensive Data Dictionary with units | Must | ✅ Done | [`Docs/ml/data_dictionary.md`](../ml/data_dictionary.md) |
| **ML1-07** | Quantify missing, duplicate, and invalid values | Must | ✅ Done | `ai-service/training/audit_datasets.py` |
| **ML1-08** | Audit target leakage & post-outcome features | Must | ✅ Done | Documented in Dataset Cards (No leakage found) |
| **ML1-09** | Record population limits & geographic mismatch | Must | ✅ Done | [`Docs/ml/cardiovascular_dataset_card.md`](../ml/cardiovascular_dataset_card.md), [`Docs/ml/diabetes_dataset_card.md`](../ml/diabetes_dataset_card.md) |
| **ML1-10** | Agree on safe, non-diagnostic user wording | Must | ✅ Done | Approved in Problem Definitions (Section 2.5 & 3.5) |

---

## 📊 Dataset Profile & Audit Metrics

### 1. UCI Cleveland Heart Disease Dataset (id=45)
* **Cohort Size:** 303 rows, 14 columns (13 predictors + 1 target).
* **Missing Values:** Exactly 6 cells across 6 rows:
  * `ca` (Fluoroscopy major vessels): 4 missing values (1.32%).
  * `thal` (Thallium myocardial perfusion defect): 2 missing values (0.66%).
* **Duplicate Rows:** 0 (0.0%).
* **Target Distribution:**
  * Class `0` (Absence of coronary artery disease, $<50\%$ diameter stenosis): 164 records (**54.1%**).
  * Class `1` (Presence of coronary artery disease, $\ge 50\%$ diameter stenosis): 139 records (**45.9%**).
* **Class Ratio:** 1.18 : 1 (Naturally balanced binary classification baseline).

### 2. CDC Diabetes Health Indicators Dataset (id=891)
* **Cohort Size:** 253,680 rows, 22 columns (21 survey predictors + 1 target).
* **Missing Values:** 0 missing values (Pre-cleaned by CDC).
* **Duplicate Rows:** 24,206 duplicate rows (9.54%) reflecting survey population clustering across discrete categorical responses.
* **Target Distribution:**
  * Class `0` (No diabetes reported): 218,334 records (**86.07%**).
  * Class `1` (Prediabetes or diabetes reported): 35,346 records (**13.93%**).
* **Class Imbalance Ratio:** **6.18 : 1** (Requires class weighting and PR-AUC / Recall optimization in Sprints 2–4).

---

## 🛡️ Critical Clinical & Regulatory Distinctions Established

1. **Classification vs. 10-Year Prospective Risk:**
   * The **Cleveland Heart Disease** classifier predicts *existing angiographic coronary artery disease* based on ECG and catheterization tests; it does NOT estimate future 10-year heart attack risk (which our Framingham ASCVD module handles).
   * The **CDC Diabetes** classifier detects *reported disease status patterns* from survey lifestyle indicators; it does NOT replace biochemical venous fasting blood glucose or $\text{HbA}_{1c}$ laboratory assays.
2. **Geographic Representation (Indian Demographics):**
   * Indian populations exhibit premature coronary disease and lower BMI obesity thresholds ($\text{BMI} \ge 23$ for overweight vs $\ge 25$ in Western cohorts).
   * Models will explicitly carry SaMD disclaimers noting this demographic variance.

---

## 📁 Artifacts Produced in Sprint 1

```
Docs/
├── ml/
│   ├── problem_definitions.md          # Intended use, target formulations & wording
│   ├── data_dictionary.md              # 35 feature definitions, ranges & units
│   ├── cardiovascular_dataset_card.md  # UCI Cleveland provenance, audit & limits
│   ├── diabetes_dataset_card.md        # CDC BRFSS provenance, class balance & limits
│   └── dataset_audit_metrics.json      # Machine-readable audit statistics
Docs/
└── Sprint/
    └── Sprint-ML-1-Summary.md          # Sprint 1 completion sign-off
ai-service/
├── data/
│   ├── cardiovascular/
│   │   └── processed.cleveland.data    # Verified local dataset copy
│   └── diabetes/
│       └── diabetes_health_indicators.csv # Verified local dataset copy
└── training/
    └── audit_datasets.py               # Reproducible profiling script
```

---

## ⏭️ Ready for ML Sprint 2
All **Definition of Ready (DoR)** criteria for ML Sprint 2 have been satisfied:
* Next Sprint Goal: **Exploratory Data Analysis (EDA) and Reproducible Preprocessing Pipelines**.
