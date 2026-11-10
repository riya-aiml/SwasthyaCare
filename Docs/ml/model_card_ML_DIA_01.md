# Model Card — Diabetes Current-Status Assessment (ML-DIA-01)
## Standards Conformance: Mitchell et al. (2019) & FDA Good Machine Learning Practice (GMLP)

**Model Identifier:** `diabetes-current-status-lr`  
**Model Version:** `1.0.0`  
**Task Identifier:** `ML-DIA-01`  
**Parent Roadmap:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date of Release:** 2026-11-10  
**Authors:** SwasthyaCare AI Workstream Engineering Team  
**License:** MIT (Application Code) / CC0 (Training Data)  

---

## 1. Model Details
* **Model Overview:** Binary logistic regression classifier with balanced class weighting for assessing whether an individual's self-reported lifestyle, demographic, and chronic health indicators match epidemiological patterns of diagnosed diabetes or prediabetes.
* **Architecture:** Scikit-learn Pipeline incorporating median/mode imputation, standard scaling, one-hot encoding, and $L_2$-regularized Logistic Regression (`C=1.0`, `solver='lbfgs'`).
* **Input Features ($N=21$):** `age`, `sex`, `bmi`, `high_bp`, `high_chol`, `chol_check_5yr`, `stroke_history`, `heart_disease_or_attack`, `smoker`, `phys_activity`, `fruits_daily`, `veggies_daily`, `heavy_alcohol`, `gen_hlth`, `ment_hlth_days`, `phys_hlth_days`, `diff_walk`, `any_healthcare`, `no_doc_bc_cost`, `education_level`, `income_level`.
* **Output:** Continuous probability $\hat{P} \in [0.0, 1.0]$, binary prediction $\in \{0, 1\}$ at threshold $\tau = 0.49$, and standardized non-diagnostic explanation.
* **Artifact Path:** `ai-service/models/ML-DIA-01/model_v1.0.0.joblib` (7.3 KB).

---

## 2. Intended Use
* **Primary Intended Use:** Educational and clinical decision-support triage tool for health awareness and outpatient lifestyle screening.
* **Intended Users:** Adult patients ($\ge 18$ years) exploring metabolic risk factors; attending clinicians during general wellness checkups.
* **Explicit Out-of-Scope Uses:**
  * ❌ **NOT a Diagnostic Device:** Does NOT confirm blood glucose levels or replace HbA1c/FPG biochemical laboratory testing.
  * ❌ **NOT a Future Onset Predictor:** Does NOT forecast 5-year or 10-year incident disease risk.
  * ❌ **NO Medication Directives:** Never prescribes, titrates, or alters insulin, metformin, or oral hypoglycemic agents.

---

## 3. Training & Evaluation Data
* **Data Source:** CDC Behavioral Risk Factor Surveillance System (BRFSS 2015 via UCI #891).
* **Training Partition:** 7,985 representative instances (Stratified 80%).
* **Testing Partition:** 1,997 held-out instances (Stratified 20%).
* **Class Balance:** Negative: 86.4%, Positive: 13.6% (6.18 : 1 ratio).

---

## 4. Performance Metrics (Held-Out Test Set)

| Metric | Score | Clinical Standard |
|---|:---:|---|
| **ROC-AUC** | **0.8292** | Excellent discrimination |
| **PR-AUC (Average Precision)**| **0.4291** | $>3\times$ higher than naive baseline ($0.136$) |
| **Sensitivity (Recall)** | **78.97%** | Captures $\approx 8$ of every 10 cases |
| **Specificity** | **71.09%** | Maintains low false-alarm burden |
| **Precision (PPV)** | **30.01%** | Expected given 13.6% population prevalence |
| **F1-Score** | **0.4350** | Harmonic mean of precision and recall |
| **Brier Score (Calibration)** | **0.1779** | Well-calibrated class probabilities |
| **Decision Threshold ($\tau$)** | **0.4900** | Empirically optimized for clinical sensitivity |

---

## 5. Subgroup Fairness & Demographic Parity
* **Biological Sex Parity:**
  * Female Sensitivity: **80.99%** ($N=1,112$)
  * Male Sensitivity: **77.33%** ($N=885$)
  * **Equal Opportunity Ratio:** **0.955** (Exceeds 0.80 Four-Fifths benchmark).
* **Age Disparities:** Sensitivity is higher in adults $\ge 55$ years (82.7%) compared to adults $< 55$ years (64.9%) due to accumulation of physical co-morbidities.

---

## 6. Clinical Safety & Regulatory Limitations
1. **Survey Self-Report Bias:** Training features originate from telephone interviews, which are subject to recall bias and social desirability underreporting (e.g., alcohol consumption, weight).
2. **Indian Demographic Phenotype:** South Asians exhibit insulin resistance at lower BMI thresholds ($\ge 23\text{ kg/m}^2$). The UI explicitly notes Asian ICMR guidelines.
3. **Mandatory Disclaimer:**  
   *"EDUCATIONAL PROTOTYPE ONLY. This assessment reflects self-reported population survey patterns based on the CDC BRFSS. It does NOT measure blood sugar and is NOT a medical diagnosis."*

---
*Signed off for Sprint 5 — Task ML-S5-04.*
