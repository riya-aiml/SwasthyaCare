# SwasthyaCare — Cardiovascular Dataset Audit Report (Task ML-S3-02)
## In-Depth Evaluation: UCI Cleveland Clinic vs. Framingham Heart Study

**Document ID:** SWC-ML-AR-CVD-001  
**Sprint:** Sprint 3 — Dataset Audit & Exploratory Data Analysis  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Clinical & Statistical Audit  

---

## 1. Executive Summary

In Sprint 3, candidate cardiovascular datasets were audited to determine their suitability for Task `ML-CVD-01` (Cardiovascular Current-Status Assessment) and evaluate feasibility for Task `ML-CVD-02` (10-Year Prospective MACE Estimation).

Two primary datasets were evaluated:
1. **UCI Cleveland Heart Disease Database** (UCI ID #45) — **APPROVED for `ML-CVD-01` Baseline**.
2. **Framingham Heart Study Longitudinal Cohort** (NHLBI / BioLINCC) — **CURRENT SPRINT 6 COX ENGINE RETAINED; DE NOVO ML TRAINING GATED**.

---

## 2. Comprehensive Candidate Comparison

| Dimension | UCI Cleveland Clinic (#45) | Framingham Heart Study Cohort |
|---|---|---|
| **Institution** | Cleveland Clinic Foundation (Dr. Robert Detrano et al., 1988) | NHLBI & Boston University (1948 – Present) |
| **Cohort Type** | Inpatient cardiology referral patients undergoing catheterization | Community-dwelling longitudinal cohort (Framingham, MA) |
| **Sample Size ($N$)** | **303 patients** | **Multi-thousand prospective participants** |
| **Number of Features** | 13 clinical, hemodynamic & ECG biomarkers | Demographic, lipid panel, smoking, systolic BP, antihypertensive use |
| **Ground Truth Target** | Catheterization: coronary stenosis $\ge 50\%$ in major coronary vessel | Prospective incident MACE (coronary death, myocardial infarction, stroke) |
| **Target Distribution** | $0 = 54.13\%$ (164), $\ge 1 = 45.87\%$ (139) | Longitudinal time-to-event with right-censoring |
| **Class Imbalance** | **Balanced (1.18 : 1 ratio)** | Event rates typically 8% – 15% over 10 years |
| **Missing Values** | 6 total missing values (4 in `ca`, 2 in `thal`) | Complete tracking with survival censoring |
| **License / Terms** | **CC BY 4.0** (Open academic / derivative use) | Restricted clinical research access (BioLINCC IRB required) |
| **Temporal Design** | **Cross-sectional** (Measurements concurrent with catheterization) | **Longitudinal prospective** (10-year / 30-year follow-up) |
| **Target Task Fit** | **APPROVED for `ML-CVD-01` Current-Status** | **EVALUATED for `ML-CVD-02` Future Risk** |

---

## 3. Deep Dive: UCI Cleveland Clinic (Approved for ML-CVD-01)

### 3.1 Demographic & Clinical Characteristics
* **Age:** Mean $54.4$ years (Range: 29 – 77 years).
* **Sex Distribution:** $68.0\%$ Male (206), $32.0\%$ Female (97). Reflects late 1980s cardiology catheterization referral patterns.
* **Hemodynamics:**
  * Resting Blood Pressure (`trestbps`): Mean $131.7\text{ mmHg}$ (Range: 94 – 200 mmHg).
  * Serum Cholesterol (`chol`): Mean $246.7\text{ mg/dL}$ (Range: 126 – 564 mg/dL).
  * Maximum Heart Rate (`thalach`): Mean $149.6\text{ bpm}$ (Range: 71 – 202 bpm).
  * Exercise ST Depression (`oldpeak`): Mean $1.04\text{ mm}$ (Range: 0.0 – 6.2 mm).

### 3.2 Top Predictors of Angiographic Stenosis
Pearson correlation analysis on the Cleveland cohort reveals the strongest diagnostic markers of $\ge 50\%$ coronary narrowing:
1. `thal` ($r = +0.5257$): Reversible or fixed thallium-201 perfusion defects signify myocardial ischemia.
2. `ca` ($r = +0.4604$): Number of calcified/opacified major vessels visible under fluoroscopy.
3. `exang` ($r = +0.4319$): Exercise-induced angina during Bruce protocol treadmill test.
4. `oldpeak` ($r = +0.4245$): Exercise-induced ST depression reflects subendocardial ischemia.
5. `cp` ($r = +0.4144$): Asymptomatic (type 4) or typical angina presentation in referral cohorts.
6. `thalach` ($r = -0.4172$): Chronotropic incompetence (inability to achieve target heart rate).

---

## 4. Relationship to Existing Platform Capabilities & Future Risk

1. **Current Sprint 6 Capability:** SwasthyaCare already possesses an institutional, peer-reviewed **Framingham 10-Year ASCVD Risk Calculator** built into the AI microservice (`/api/ai/predict/heart-risk`), implementing published NHLBI Cox proportional hazards coefficients.
2. **ML Integration Boundary:** The UCI Cleveland dataset **cannot** be repurposed for 10-year prospective risk prediction. Catheterization measurements indicate current arterial narrowing, not future 10-year stroke incidence.
3. **Verdict on Task ML-CVD-02:** `ML-CVD-02` is **GATED / DEFERRED**. The existing Framingham calculator continues to serve 10-year prospective risk support, while the new ML pipeline focuses strictly on cross-sectional pattern classification (`ML-CVD-01`).

---
*Signed off for Sprint 3 — Task ML-S3-02.*
