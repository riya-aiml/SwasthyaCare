# Model Card — Cardiovascular Current-Status Assessment (ML-CVD-01)
## Standards Conformance: Mitchell et al. (2019) & FDA Good Machine Learning Practice (GMLP)

**Model Identifier:** `cardiovascular-current-status-rf`  
**Model Version:** `1.0.0`  
**Task Identifier:** `ML-CVD-01`  
**Parent Roadmap:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date of Release:** 2026-11-10  
**Authors:** SwasthyaCare AI Workstream Engineering Team  
**License:** MIT (Application Code) / CC BY 4.0 (Training Data)  

---

## 1. Model Details
* **Model Overview:** Random Forest ensemble classifier for assessing whether a patient's non-invasive hemodynamic, electrocardiographic (ECG), and clinical diagnostic biomarkers are consistent with angiographically confirmed coronary artery disease ($\ge 50\%$ diameter stenosis in at least one major coronary artery).
* **Architecture:** Scikit-learn Pipeline with median/mode imputation, standard scaling, one-hot encoding, and 100-tree Random Forest (`n_estimators=100`, `max_depth=5`, `min_samples_leaf=3`).
* **Input Features ($N=13$):** `age`, `sex`, `chest_pain_type`, `resting_bp`, `cholesterol`, `fasting_blood_sugar_gt_120`, `resting_ecg`, `max_heart_rate`, `exercise_induced_angina`, `st_depression`, `st_slope`, `num_major_vessels`, `thalassemia`.
* **Output:** Continuous probability $\hat{P} \in [0.0, 1.0]$, binary prediction $\in \{0, 1\}$ at threshold $\tau = 0.55$, and non-directive clinical recommendations.
* **Artifact Path:** `ai-service/models/ML-CVD-01/model_v1.0.0.joblib` (352 KB).

---

## 2. Intended Use
* **Primary Intended Use:** Educational and clinical decision-support prototype assisting clinicians during outpatient cardiology consultations and stress-test interpretation.
* **Intended Users:** Cardiologists, internal medicine physicians, and verified adult clinical patients reviewing diagnostic reports.
* **Explicit Out-of-Scope Uses:**
  * ❌ **NOT an Emergency ACS Triage Tool:** Acute chest pain, ST-elevation myocardial infarction (STEMI), or acute coronary syndrome requires immediate emergency medical evaluation, troponin assays, and emergency cath-lab activation.
  * ❌ **NOT a 10-Year Cardiovascular Event Estimator:** The Cleveland benchmark measures cross-sectional anatomical stenosis; it does NOT forecast 10-year stroke or heart attack incidence (which our existing Framingham ASCVD module addresses).
  * ❌ **NO Intervention Directives:** Never orders angioplasty, stenting, CABG surgery, or anti-thrombotic medication changes.

---

## 3. Training & Evaluation Data
* **Data Source:** Cleveland Clinic Foundation Heart Disease Database (Dr. Robert Detrano et al., via UCI #45).
* **Training Partition:** 242 confirmed catheterization patients (Stratified 80%).
* **Testing Partition:** 61 held-out catheterization patients (Stratified 20%).
* **Class Balance:** Negative: 54.1%, Positive: 45.9% (1.18 : 1 ratio).

---

## 4. Performance Metrics (Held-Out Test Set)

| Metric | Score | Clinical Standard |
|---|:---:|---|
| **ROC-AUC** | **0.9675** | Outstanding diagnostic discrimination |
| **PR-AUC (Average Precision)**| **0.9562** | Superior precision across all operating points |
| **Sensitivity (Recall)** | **92.86%** | High sensitivity (26 of 28 positive cases identified) |
| **Specificity** | **93.94%** | Low false alarm rate (31 of 33 negative cases correctly ruled out) |
| **Precision (PPV)** | **92.86%** | High confidence positive alerts |
| **F1-Score** | **0.9286** | Harmonic mean of precision and recall |
| **Brier Score (Calibration)** | **0.0764** | Excellent probability calibration |
| **Decision Threshold ($\tau$)** | **0.5500** | Empirically optimized operating point |

---

## 5. Subgroup Fairness & Demographic Parity
* **Biological Sex Parity:**
  * Female Sensitivity: **85.71%** ($N=20$)
  * Male Sensitivity: **95.24%** ($N=41$)
  * Female Specificity: **100.0%**
  * **Equal Opportunity Ratio:** **0.900** (Exceeds 0.80 benchmark).
* **Demographic Limitations:** Inpatient Cleveland cohort is 68% male. Female CAD frequently involves microvascular disease without epicardial obstruction.

---

## 6. Clinical Safety & Regulatory Limitations
1. **Inpatient Selection Bias:** Patients referred for coronary angiography in 1988 represent higher pre-test probability than unselected community outpatients.
2. **South Asian CAD Vulnerability:** Indian individuals develop CAD 5–10 years earlier than Western cohorts. The UI explicitly includes an Asian epidemiological advisory.
3. **Mandatory Disclaimer:**  
   *"EDUCATIONAL PROTOTYPE ONLY. This assessment reflects cross-sectional diagnostic patterns from the clinical UCI Cleveland benchmark. It is NOT a clinical diagnosis and does NOT replace invasive angiography, 12-lead ECG, or physician consultation. If experiencing acute chest discomfort or shortness of breath, call emergency medical services immediately."*

---
*Signed off for Sprint 5 — Task ML-S5-04.*
