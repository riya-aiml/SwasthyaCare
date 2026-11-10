# SwasthyaCare — Diabetes Dataset Audit Report (Task ML-S3-01)
## In-Depth Evaluation: CDC BRFSS vs. Pima Indians Database

**Document ID:** SWC-ML-AR-DIA-001  
**Sprint:** Sprint 3 — Dataset Audit & Exploratory Data Analysis  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Clinical & Statistical Audit  

---

## 1. Executive Summary

In Sprint 3, SwasthyaCare conducted an exhaustive audit of candidate diabetes datasets to identify the appropriate training foundation for Task `ML-DIA-01` (Diabetes Current-Status Assessment) and evaluate feasibility for Task `ML-DIA-02` (5-Year Future-Risk Estimation).

Two primary candidate datasets were evaluated against the 6-point verification gate established in Sprint 1:
1. **CDC BRFSS 2015 Diabetes Health Indicators** (UCI ID #891) — **APPROVED for `ML-DIA-01`**.
2. **Pima Indians Diabetes Database** (NIDDK / UCI) — **REJECTED for General Outpatient Screening**.

---

## 2. Comprehensive Candidate Comparison

| Dimension | CDC BRFSS 2015 (UCI #891) | Pima Indians Diabetes (NIDDK) |
|---|---|---|
| **Provenance** | U.S. Centers for Disease Control and Prevention (CDC) | National Institute of Diabetes and Digestive and Kidney Diseases |
| **Cohort Profile** | Representative sample of 253,680 civilian adults | 768 Native American females aged $\ge 21$ in Phoenix, Arizona |
| **Sample Size ($N$)** | **253,680 instances** | **768 instances** |
| **Number of Features** | 21 survey and behavioral indicators | 8 clinical / biochemical measurements |
| **Ground Truth Target** | Self-reported doctor diagnosis of diabetes/prediabetes | 2-hour post-load oral glucose tolerance test ($\ge 200\text{ mg/dL}$) |
| **Target Distribution** | $0 = 86.07\%$ (218,334), $1 = 13.93\%$ (35,346) | $0 = 65.1\%$ (500), $1 = 34.9\%$ (268) |
| **Class Imbalance** | **6.18 : 1 ratio** (requires class-weighting) | **1.87 : 1 ratio** (moderately balanced) |
| **Missing Values** | **0 missing values** across all 253,680 rows | Physiological zero anomalies (374 zeros in insulin, 227 in triceps skinfold, 35 in BP, 5 in glucose) |
| **Row Duplicates** | 24,206 duplicates (9.54%) due to discrete telephone answer clustering | 0 duplicates |
| **License / Terms** | **CC0 Public Domain** (Open Federal Data) | Public Domain / CC0 |
| **Temporal Design** | **Cross-sectional** annual surveillance | **Cross-sectional slice** |
| **Target Task Fit** | **APPROVED for `ML-DIA-01` Current-Status** | **REJECTED for general outpatient screening** |

---

## 3. Deep Dive: CDC BRFSS 2015 (Approved for ML-DIA-01)

### 3.1 Feature Inventory & Preprocessing Mapping
The dataset features 21 validated behavioral, metabolic, and socioeconomic predictors:
* **Core Biometrics:** `BMI` (Mean: $28.38\text{ kg/m}^2$, Range: $12.0 - 98.0$), `Age` (13 ordinal bands), `Sex` (55.9% female, 44.1% male).
* **Metabolic Flags:** `HighBP` (42.9% prevalence), `HighChol` (42.4% prevalence), `CholCheck` (96.3% checked in 5 yrs).
* **Chronic Co-morbidities:** `Stroke` (4.1% prevalence), `HeartDiseaseorAttack` (9.4% prevalence).
* **Lifestyle:** `Smoker` (44.3%), `PhysActivity` (75.7%), `Fruits` (63.4%), `Veggies` (81.1%), `HvyAlcoholConsump` (5.6%).
* **Subjective Health:** `GenHlth` (1-5 scale, Mean: 2.51), `MentHlth` (Mean: 3.18 days), `PhysHlth` (Mean: 4.24 days), `DiffWalk` (16.8%).
* **Access Factors:** `AnyHealthcare` (95.1%), `NoDocbcCost` (8.4%), `Education` (1-6 scale), `Income` (1-8 scale).

### 3.2 Top Predictors of Diabetes Status
Pearson correlation analysis on the 253,680 instances identifies the primary correlation drivers:
1. `GenHlth` ($r = +0.2936$): Poor general health perception strongly tracks metabolic disease burden.
2. `HighBP` ($r = +0.2631$): Co-occurrence of essential hypertension and insulin resistance.
3. `DiffWalk` ($r = +0.2183$): Physical disability resulting from peripheral neuropathy and vascular morbidity.
4. `BMI` ($r = +0.2168$): Adiposity-driven insulin receptor downregulation.
5. `HighChol` ($r = +0.2003$): Atherogenic dyslipidemia pattern.

---

## 4. Scientific Justification for Pima Indians Rejection

While the Pima Indians database is historically famous in computer science coursework, deploying it inside an Indian digital healthcare platform represents a severe clinical error:

1. **Cohort-Specific Genetic Homogeneity:** The Pima community has the highest recorded prevalence of Type 2 Diabetes in the world due to unique thrifty-gene evolutionary selection and dietary transition. Modeling on Pima Native Americans cannot be generalized to South Asian outpatients.
2. **Biological Inconsistencies (Data Quality):** 
   * $48.7\%$ of participants have `Insulin = 0`, which is biologically fatal in living adults.
   * $29.6\%$ have `SkinThickness = 0`, representing unrecorded/missing measurements entered as numerical zeros rather than `NaN`.
3. **Misleading Name Association:** Inexperienced practitioners frequently assume "Pima Indian" refers to the subcontinent of India. The cohort is Native American; misrepresenting it as an Indian clinical model violates academic honesty and medical device transparency.

---

## 5. Feasibility Verdict for Task ML-DIA-02 (Future Risk)

* **Finding:** The CDC BRFSS is an annual cross-sectional survey. It records respondents' current health status at the moment of interview. It does **not** follow healthy participants forward in time to observe incident diabetes conversion.
* **Verdict:** `ML-DIA-02` (5-Year Future-Risk Estimation) is **GATED / DEFERRED**. Cross-sectional CDC data will NOT be used to generate speculative future onset probabilities.

---
*Signed off for Sprint 3 — Task ML-S3-01.*
