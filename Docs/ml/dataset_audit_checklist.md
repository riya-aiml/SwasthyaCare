# SwasthyaCare — Dataset Audit & Verification Checklist

**Document ID:** SWC-ML-CK-001  
**Sprint:** Sprint 1 — ML Discovery & Problem Definition  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  

---

## 1. Dataset Eligibility & Audit Criteria Checklist

Every dataset considered for integration into SwasthyaCare must pass this 6-point verification gate before exploratory analysis or model training is permitted to begin.

### Section A: Provenance, Legal & Licensing Verification
- [x] **A.1 Source Provenance:** Verified academic or government institution (e.g., Cleveland Clinic Foundation, CDC, NHLBI, WHO).
- [x] **A.2 License & Usage Terms:** Permitted for academic, educational, and derivative software engineering development without intellectual property violation (CC BY 4.0 or CC0 Public Domain verified).
- [x] **A.3 Patient Privacy & De-Identification:** Zero raw names, phone numbers, addresses, social security identifiers, or biometric images. Full HIPAA Safe Harbor de-identification confirmed.

### Section B: Target Label Rigor & Clinical Suitability
- [x] **B.1 Unambiguous Ground Truth:** Target definition has established clinical ground truth (e.g., coronary stenosis $>50\%$ confirmed via fluoroscopic catheterization; reported diagnosis verified via structured survey).
- [x] **B.2 Target Classification Type:** Target aligns with task design (e.g., Cross-sectional disease presence for `ML-CVD-01`; NOT mislabeled as prospective future onset).
- [x] **B.3 Missing Target Data:** Rows with missing target values are 0 (Both UCI Cleveland and CDC BRFSS have 100% complete target labels).

### Section C: Feature Integrity & Data Leakage Prevention
- [x] **C.1 Temporal Integrity:** Predictor features represent measurements taken *prior to* or *concomitant with* diagnostic evaluation, not post-treatment outcomes or medication response.
- [x] **C.2 No Post-Intervention Leakage:** No surgical interventions, recovery ratings, or medication titration statuses are included as input features.
- [x] **C.3 Documented Clinical Units:** All continuous predictors have documented physiological units (e.g., `trestbps` in mmHg, `chol` in mg/dL, `thalach` in bpm, `BMI` in kg/m²).

### Section D: Missingness & Data Quality Profiling
- [x] **D.1 Quantified Missingness:** Percentage of missing values across all columns is calculated and documented (Cleveland has 1.98% missing in 2 columns; CDC has 0.0% missing).
- [x] **D.2 Documented Imputation Strategy:** Preprocessing plan establishes median/mode imputation fit exclusively on the training split in Sprint 2.
- [x] **D.3 Duplicate Profiling:** Exact row duplicates identified and investigated (0 in Cleveland; 24,206 in CDC BRFSS explained by discrete telephone survey answer clustering).

### Section E: Population Representation & Bias Awareness
- [x] **E.1 Demographic Distribution:** Age and biological sex distributions quantified (Cleveland: 68% Male, 32% Female; CDC: Balanced national adult cross-section).
- [x] **E.2 Geographic & Ethnic Mismatch:** Explicitly records that North American datasets do not fully represent South Asian / Indian epidemiology (premature CAD onset, lower BMI visceral obesity thresholds).
- [x] **E.3 Disclaimers & Limitations:** Mandatory SaMD educational prototype disclaimers attached to all models trained on candidate datasets.

### Section F: Future-Risk Longitudinal Gating (Conditional Gate)
- [x] **F.1 Longitudinal Time Horizon Verified:** Check whether the dataset tracks participants over prospective multi-year intervals ($\Delta t = 5$ or 10 years).
  - *Result for Cleveland & CDC:* **FAIL (Cross-sectional only).**
- [x] **F.2 Incident Event Documentation:** Check whether baseline subjects are disease-free and incident events are adjudicated over time.
  - *Result for Cleveland & CDC:* **FAIL (Cross-sectional only).**
- [x] **F.3 Go / No-Go Decision on Future-Risk Tasks:**
  - Tasks `ML-DIA-02` and `ML-CVD-02` are **DEFERRED / GATED**. No de novo machine learning models will be trained on cross-sectional data and presented as future-risk predictors.

---

## 2. Audit Sign-Off Status for Candidate Datasets

| Candidate Dataset | Source | Purpose | Audit Status | Approved Next Step |
|---|---|---|:---:|---|
| **UCI Cleveland Heart Disease** | UCI #45 | `ML-CVD-01` Current-Status | ✅ **PASSED** | Proceed to Sprint 2 Preprocessing & EDA |
| **CDC Diabetes Health Indicators**| UCI #891| `ML-DIA-01` Current-Status | ✅ **PASSED** | Proceed to Sprint 2 Preprocessing & EDA |
| **Pima Indians Diabetes** | NIDDK | General Outpatient Screening | ❌ **REJECTED**| Excluded due to population mismatch |
| **Cross-Sectional for Future Risk**| - | `ML-DIA-02` & `ML-CVD-02` | ❌ **GATED** | Deferred until longitudinal cohort approval |

---
*Verified and Approved for ML Sprint 1.*
