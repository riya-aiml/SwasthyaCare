# SwasthyaCare — Prediction Problem Definitions & Target Specifications
## Tasks ML-S1-03, ML-S1-04 & ML-S1-05: Discrete ML Task Formulations

**Document ID:** SWC-ML-PD-002  
**Sprint:** Sprint 1 — ML Discovery & Problem Definition  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Specification Baseline  

---

## 1. Architectural Scope & The Four Discrete Tasks

In strict conformance with Section 2 of the ML Sprint Integration Specification, SwasthyaCare defines four mutually exclusive prediction tasks. 

**Critical Foundational Principle:**  
*Current-status classification* (detecting whether existing clinical measurements or survey responses match disease patterns) and *future-risk estimation* (predicting the prospective probability of incident disease onset over a future time horizon) are **fundamentally different mathematical and clinical problems**. They require separate targets, separate data schemas, separate validation methodologies, and separate model version identifiers.

```
+-----------------------------------------------------------------------------------------------+
|                               SWASTHYACARE ML WORKSTREAM                                      |
+-----------------------------------------------------------------------------------------------+
                 │                                                              │
                 ▼                                                              ▼
    [ DIABETES WORKSTREAM ]                                     [ CARDIOVASCULAR WORKSTREAM ]
    ├── ML-DIA-01: Current-Status Classification                 ├── ML-CVD-01: Current-Status Classification
    └── ML-DIA-02: Future-Risk Estimation (Conditional)         └── ML-CVD-02: Future-Risk Estimation (Conditional)
```

---

## 2. Task ML-DIA-01: Diabetes Current-Status Assessment

### 2.1 Clinical & Technical Problem Definition
Given a vector of self-reported lifestyle indicators, demographic traits, and metabolic health history (e.g., High Blood Pressure, High Cholesterol, BMI, Physical Activity, General Health perception), classify whether the respondent's reported profile is consistent with a medical diagnosis of Diabetes or Prediabetes.

### 2.2 Mathematical Target Formulation
* **Target Identifier:** `Diabetes_binary`
* **Target Type:** Binary classification $\in \{0, 1\}$
* **Label Ground Truth:**
  $$Y_{\text{DIA-01}} = \begin{cases} 0 & \text{No diabetes reported by respondent} \\ 1 & \text{Prediabetes or diabetes reported by respondent} \end{cases}$$
* **Mathematical Objective:** Estimate the posterior probability $P(Y_{\text{DIA-01}} = 1 \mid \mathbf{x})$, where $\mathbf{x} \in \mathbb{R}^{21}$ represents the validated survey feature vector.

### 2.3 Intended Inputs
* **Demographics:** Age (13 categorical bands), Biological Sex.
* **Biometrics:** Body Mass Index (BMI in $\text{kg/m}^2$).
* **Metabolic History:** High Blood Pressure status, High Cholesterol status, 5-year cholesterol check history.
* **Lifestyle & Behaviors:** Smoker status (>100 cigarettes lifetime), Physical activity in past 30 days, Daily fruit intake, Daily vegetable intake, Heavy alcohol consumption.
* **Subjective Health:** General health scale (1–5), Physical unhealthy days (0–30), Mental unhealthy days (0–30), Difficulty walking/climbing stairs.

### 2.4 Explicit Exclusions & Safety Boundaries
* ❌ **NOT a Future Onset Estimator:** This model does NOT predict whether a healthy patient will develop diabetes in 5 or 10 years.
* ❌ **NOT an HbA1c or Glycemic Replacement:** The model cannot confirm biochemical glycemic levels; it evaluates behavioral/metabolic risk patterns.
* ❌ **NO Medication Directives:** The system will never recommend insulin, metformin, or sulfonylurea initiation or dosage alteration.

### 2.5 Approved User-Facing Prediction Wording
* **Positive Classification ($Y=1$):**  
  `"Reported Profile Consistent with Elevated Diabetes Indicator Pattern"`
* **Negative Classification ($Y=0$):**  
  `"Reported Profile Currently Not Indicative of Elevated Diabetes Pattern"`
* **Mandatory Accompanying Disclaimer:**  
  *"EDUCATIONAL PROTOTYPE ONLY. This assessment reflects self-reported population survey patterns from the CDC BRFSS. It does NOT measure blood sugar and is NOT a medical diagnosis. If you have concerns, consult a physician for fasting plasma glucose and HbA1c testing."*

---

## 3. Task ML-DIA-02: Diabetes Future-Risk Estimation (Data-Dependent / Conditional)

### 3.1 Clinical & Technical Problem Definition
Given baseline demographic, dietary, anthropometric, and biochemical parameters of an individual with *no diagnosed diabetes at baseline*, estimate the prospective probability of developing incident Type 2 Diabetes Mellitus over a defined future time horizon (e.g., 5-year or 10-year horizon).

### 3.2 Required Cohort & Data Prerequisites (Gating Conditions)
To proceed from planning to implementation, the task requires:
1. **Longitudinal Study Cohort:** A confirmed prospective cohort where all participants are normoglycemic or prediabetic at baseline ($t_0$).
2. **Fixed or Time-to-Event Horizon:** Explicit observation interval (e.g., $\Delta t = 5$ years or 10 years).
3. **Confirmed Incident Outcome:** Documented transition to diabetic status verified by laboratory criteria ($\text{FPG} \ge 126\text{ mg/dL}$, $\text{HbA}_{1c} \ge 6.5\%$, or clinician diagnosis) during the follow-up window.
4. **Censoring Information:** Clear recording of loss to follow-up, competing mortalities, and dropouts.

### 3.3 Current Status: **DEFERRED / DATA-DEPENDENT**
* **Finding:** Public cross-sectional survey datasets (such as CDC BRFSS or Pima Indians cross-sectional slice) **do not support longitudinal future onset modeling**.
* **Decision:** `ML-DIA-02` will remain in a **Deferred / Research Gate** state. No synthetic or invented future risk estimates will be exposed in production until a validated longitudinal dataset is formally audited and clinically approved.
* **User-Facing Notice:** The platform UI will display:  
  `"Future 5-Year Diabetes Risk Model is currently undergoing longitudinal validation and is not available in this release."`

---

## 4. Task ML-CVD-01: Cardiovascular Current-Status Assessment

### 4.1 Clinical & Technical Problem Definition
Given a vector of 13 routine demographic, resting hemodynamic, and exercise electrocardiographic (ECG Bruce protocol) biomarkers, estimate whether the patient's diagnostic profile is consistent with angiographically confirmed coronary artery disease ($\ge 50\%$ diameter stenosis in at least one major coronary artery).

### 4.2 Mathematical Target Formulation
* **Target Identifier:** `target` (binarized from Cleveland angiographic severity $0, 1, 2, 3, 4$)
* **Target Type:** Binary classification $\in \{0, 1\}$
* **Label Ground Truth:**
  $$Y_{\text{CVD-01}} = \begin{cases} 0 & \text{No hemodynamically significant stenosis } (< 50\% \text{ diameter stenosis}) \\ 1 & \text{Presence of significant stenosis } (\ge 50\% \text{ diameter stenosis}) \end{cases}$$
* **Mathematical Objective:** Estimate $P(Y_{\text{CVD-01}} = 1 \mid \mathbf{x})$, where $\mathbf{x} \in \mathbb{R}^{13}$.

### 4.3 Intended Inputs
* **Demographics:** Age (years), Biological Sex.
* **Hemodynamics & Biochemistry:** Resting Blood Pressure (`trestbps`, mmHg), Serum Total Cholesterol (`chol`, mg/dL), Fasting Blood Sugar > 120 mg/dL (`fbs`).
* **Electrocardiography & Exercise Vitals:** Resting ECG results (`restecg`), Maximum heart rate achieved during exercise (`thalach`, bpm), Exercise-induced angina (`exang`), ST depression relative to rest (`oldpeak`, mm), Slope of peak exercise ST segment (`slope`).
* **Advanced Non-Invasive Diagnostics:** Number of major vessels colored by fluoroscopy (`ca`, 0–3), Thallium-201 scintigraphy status (`thal`).

### 4.4 Explicit Exclusions & Safety Boundaries
* ❌ **NOT a 10-Year Cardiovascular Event Estimator:** The Cleveland benchmark measures cross-sectional stenosis found on catheterization; it does NOT predict 10-year stroke or myocardial infarction incidence (which our existing Framingham ASCVD module addresses).
* ❌ **NOT an Emergency Triage Tool for Acute Coronary Syndrome (ACS):** Acute chest pain requires immediate emergency medical evaluation, troponin blood tests, and 12-lead ECG.
* ❌ **NO Intervention Directives:** Does not recommend coronary stenting, bypass surgery, or anti-thrombotic medication.

### 4.5 Approved User-Facing Prediction Wording
* **Positive Classification ($Y=1$):**  
  `"Biomarker Pattern Suggestive of Significant Coronary Stenosis Pattern"`
* **Negative Classification ($Y=0$):**  
  `"Biomarker Pattern Not Indicative of Significant Coronary Stenosis"`
* **Mandatory Accompanying Disclaimer:**  
  *"EDUCATIONAL PROTOTYPE ONLY. This assessment evaluates cross-sectional diagnostic patterns from the UCI Cleveland benchmark. It is NOT a clinical diagnosis and does NOT replace coronary angiography or clinical consultation. If experiencing acute chest discomfort or shortness of breath, seek emergency medical care immediately."*

---

## 5. Task ML-CVD-02: Cardiovascular Future-Risk Estimation (Data-Dependent / Conditional)

### 5.1 Clinical & Technical Problem Definition
Given baseline cardiovascular biomarkers of an individual *without documented symptomatic cardiovascular disease*, estimate the prospective 10-year probability of suffering a major adverse cardiovascular event (MACE: myocardial infarction, ischemic stroke, or cardiovascular death).

### 5.2 Required Cohort & Data Prerequisites (Gating Conditions)
1. **Prospective Cohort:** Multi-year prospective epidemiological study (e.g., Framingham Heart Study, Jackson Heart Study, UK Biobank).
2. **Standardized 10-Year Follow-Up:** Rigorous monitoring of participants with adjudication of clinical endpoints (adjudicated ECGs, autopsy records, hospital discharge ICD codes).
3. **Survival & Censoring Data:** Time-to-event timestamps ($T_i$) and right-censoring flags ($\delta_i$).

### 5.3 Relationship to Existing Platform Capabilities
* **Existing Sprint 6 Capability:** SwasthyaCare already possesses an institutional, peer-reviewed **Framingham 10-Year ASCVD Risk Calculator** built into the AI microservice (`/api/ai/predict/heart-risk`), implementing published NHLBI Cox proportional hazards coefficients.
* **ML Integration Position:** Training an *independent de novo machine learning model* for `ML-CVD-02` requires access to raw longitudinal participant-level cohort records.
* **Decision:** In conformance with Section 2 of `SwasthyaCare_ML_Sprint_Integration_v1.0.md`, `ML-CVD-02` is marked **Data-Dependent / Gated**. The existing Framingham calculator continues to serve 10-year prospective risk support, while the new ML pipeline focuses on cross-sectional diagnostic pattern classification (`ML-CVD-01`).

---

## 6. Summary Comparison Matrix of the Four Tasks

| Task Identifier | Disease Domain | Assessment Dimension | Mathematical Type | Input Source | Implementation Status |
|:---:|---|---|---|---|:---:|
| **`ML-DIA-01`** | Diabetes | Current-Status Classification | Binary Classification | CDC BRFSS 21 Survey Indicators | **Active (Sprint 2–6)** |
| **`ML-DIA-02`** | Diabetes | 5-Year Prospective Risk | Survival / Time-to-Event | Longitudinal Cohort Data | **Deferred (Gated)** |
| **`ML-CVD-01`** | Cardiovascular | Current-Status Classification | Binary Classification | UCI Cleveland 13 Biomarkers | **Active (Sprint 2–6)** |
| **`ML-CVD-02`** | Cardiovascular | 10-Year Prospective MACE | Survival / Cox Regression | Longitudinal Epidemiological Cohort | **Deferred (Gated)** |

---
*Signed off for Sprint 1 — Tasks ML-S1-03, ML-S1-04 & ML-S1-05.*
