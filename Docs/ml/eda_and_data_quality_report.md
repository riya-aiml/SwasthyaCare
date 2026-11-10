# SwasthyaCare — Exploratory Data Analysis & Data Quality Report
## Tasks ML-S3-03 & ML-S3-04: Missingness, Duplicates, Distributions & Demographic Bias

**Document ID:** SWC-ML-EDA-002  
**Sprint:** Sprint 3 — Dataset Audit & Exploratory Data Analysis  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Technical & Clinical Specification  

---

## 1. Missingness Profiling & Imputation Protocol (Task ML-S3-03)

### 1.1 CDC BRFSS Diabetes Indicators (UCI #891)
* **Total Instances:** 253,680
* **Total Columns:** 22 (21 features + 1 target)
* **Total Missing Values:** **0 (0.00%)**
* **Finding:** The CDC BRFSS dataset prepared for machine learning contains zero `NaN` or unrecorded entries. Telephone interview skip patterns and non-responses were filtered during preprocessing at the CDC surveillance division.

### 1.2 UCI Cleveland Heart Disease (UCI #45)
* **Total Instances:** 303
* **Total Columns:** 14 (13 features + 1 target)
* **Total Missing Values:** **6 (0.14% of matrix cells)**
  * Column `ca` (number of major vessels colored by fluoroscopy): **4 missing values** (Instances #167, #193, #288, #303 entered as `?`).
  * Column `thal` (thallium heart scintigraphy): **2 missing values** (Instances #88, #267 entered as `?`).
* **Approved Imputation Protocol:**
  * In Sprint 2 and Sprint 4, missing values are imputed strictly within the `scikit-learn` `ColumnTransformer` fit **only** on the training partition ($D_{\text{train}}$).
  * `ca` is imputed using the median ($D_{\text{train}}$).
  * `thal` is imputed using the mode / most frequent class ($D_{\text{train}}$, normal = 3).
  * Zero test partition information is used during imputation.

---

## 2. Duplicate Row Analysis

### 2.1 CDC BRFSS Row Clustering
* **Exact Duplicate Rows:** 24,206 instances (**9.54%** of the dataset).
* **Clinical Investigation:**  
  Unlike clinical trial data where duplicate rows signify database entry corruption, the CDC BRFSS dataset consists of discrete survey questions with low-cardinality responses (e.g., binary 0/1 for 15 questions, integer scales 1-5 for health, and 13 age bands).
  * With millions of adults answering a 21-question discrete survey, thousands of healthy, young, non-smoking, physically active individuals naturally produce identical response vectors.
  * Removing these rows would artificially distort population prevalence and destroy true epidemiological density.
* **Engineering Decision:** Retain the full dataset for representative survey prevalence estimation, with stratified cross-validation.

### 2.2 UCI Cleveland Clinic
* **Exact Duplicate Rows:** **0 (0.00%)**. Every patient record in the Cleveland cohort represents a unique hemodynamic and angiographic profile.

---

## 3. Class Imbalance Analysis & Mitigation Strategy (Task ML-S3-04)

```
[ CDC BRFSS DIABETES (253,680 records) ]
Negative: 218,334 (86.07%) ████████████████████████████████████████ (6.18 : 1)
Positive:  35,346 (13.93%) ██████

[ UCI CLEVELAND CVD (303 records) ]
Negative:     164 (54.13%) ██████████████████████ (1.18 : 1)
Positive:     139 (45.87%) ██████████████████
```

### 3.1 Diabetes Imbalance Protocol (`ML-DIA-01`)
* **Challenge:** A naive classifier predicting negative for all patients achieves $86.07\%$ accuracy while missing 100% of diabetic patients (0% sensitivity).
* **Approved Mitigation:**
  1. **Primary: Algorithmic Class Weighting:**  
     Use `class_weight='balanced'` in Logistic Regression and Random Forest. This weights positive misclassifications inversely proportional to class frequencies:
     $$w_1 = \frac{N}{2 \cdot N_1} = \frac{253680}{2 \cdot 35346} \approx 3.59, \quad w_0 = \frac{N}{2 \cdot N_0} \approx 0.58$$
  2. **Evaluation Metrics:** Prohibit accuracy as the sole performance metric. Optimize **Sensitivity (Recall)**, **Precision**, **F1-Score**, and **PR-AUC**.
  3. **Decision Threshold Calibration:** In Sprint 5, select an operating threshold $\tau < 0.5$ (e.g., $\tau \approx 0.32$) to maintain clinical sensitivity $\ge 80\%$.

### 3.2 Cardiovascular Imbalance Protocol (`ML-CVD-01`)
* **Finding:** The Cleveland dataset is naturally balanced (54.1% negative vs 45.9% positive) due to high CAD prevalence in hospital catheterization referral cohorts.
* **Strategy:** Standard stratified sampling without synthetic oversampling.

---

## 4. Demographic & Population Variance (Indian Clinical Context)

A critical requirement of Section 4 of `SwasthyaCare_ML_Sprint_Integration_v1.0.md` is documenting demographic mismatch between benchmark training cohorts and target South Asian populations.

### 4.1 Premature Onset of Coronary Artery Disease in India
* **Cleveland Cohort:** Mean age of CAD diagnosis in the Cleveland dataset is **54.4 years**.
* **Epidemiological Reality in India:** Extensive cardiology research (e.g., the INTERHEART study and Indian Heart Association data) demonstrates that Indian patients experience myocardial infarction and coronary stenosis **5 to 10 years earlier** than Western populations. Over $50\%$ of CAD-related deaths in India occur in individuals under 50 years of age.
* **Platform Mitigation:** SwasthyaCare includes an explicit clinical note on assessment cards:  
  *"Note: South Asian individuals have an earlier epidemiological onset of coronary artery disease. Symptoms or risk factors should be investigated at earlier ages than indicated by Western historical cohorts."*

### 4.2 Body Mass Index (BMI) Visceral Obesity Thresholds
* **Western Guidelines (CDC BRFSS):**
  * Normal: $18.5 - 24.9\text{ kg/m}^2$
  * Overweight: $25.0 - 29.9\text{ kg/m}^2$
  * Obese: $\ge 30.0\text{ kg/m}^2$
* **WHO South Asian & Indian ICMR Guidelines:**
  * Asian Indians exhibit the "thin-fat" phenotype (higher percentage of body fat and visceral adiposity at lower BMI):
  * Normal: $18.0 - 22.9\text{ kg/m}^2$
  * Overweight: $23.0 - 24.9\text{ kg/m}^2$
  * Obese: $\ge 25.0\text{ kg/m}^2$
* **Platform Mitigation:** While the underlying ML model evaluates the continuous numerical BMI value, the SwasthyaCare UI presents Indian-specific visceral adiposity reference ranges in patient-facing education cards.

---
*Signed off for Sprint 3 — Tasks ML-S3-03 & ML-S3-04.*
