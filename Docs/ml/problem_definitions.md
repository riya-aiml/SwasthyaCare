# SwasthyaCare — ML Sprint 1: Problem Definitions & Target Formulations

**Document ID:** SWC-ML-PD-001  
**Sprint:** ML Sprint 1 (Weeks 1–2)  
**Version:** 1.0.0  
**Project:** SwasthyaCare — AI-Assisted Clinical Workflow & Risk Assessment System  
**Classification:** ML Engineering Specification & Regulatory Intended-Use Dossier  

---

## 1. Overview & Regulatory Intended Use

In adherence to the Software as a Medical Device (SaMD) regulatory guidance (FDA SaMD Action Plan and EU MDR 2017/745), this document explicitly formalizes the mathematical targets, intended clinical use, out-of-scope boundaries, and approved user-facing wording for the initial machine learning models in SwasthyaCare.

---

## 2. Problem Statement 1: Cardiovascular Disease Classification (UCI Cleveland Subset)

### 2.1 Clinical & Technical Problem Statement
Given a structured vector of 13 routine demographic, non-invasive physiological, and diagnostic exercise test biomarkers, predict whether a patient exhibits angiographically confirmed presence of coronary heart disease (defined as $\ge 50\%$ diameter stenosis in at least one major coronary artery).

### 2.2 Mathematical Target Formulation
* **Raw Target Variable (`target` / `num`):** Integer ordinal scale $\in \{0, 1, 2, 3, 4\}$
  * `0`: Angiographic absence of coronary disease ($< 50\%$ diameter stenosis)
  * `1, 2, 3, 4`: Angiographic presence of coronary disease ($\ge 50\%$ diameter stenosis across single, double, triple, or quadruple vessel disease)
* **Formulated Prototype Target ($Y_{\text{cardio}}$):** Binary classification
  $$Y_{\text{cardio}} = \begin{cases} 0 & \text{if } \text{target} = 0 \quad (\text{Absence of significant stenosis}) \\ 1 & \text{if } \text{target} > 0 \quad (\text{Presence of significant stenosis}) \end{cases}$$

### 2.3 Intended Use
* **Primary Intended Use:** Educational decision-support prototype assisting junior clinicians and triage nurses in recognizing multi-variate symptom and diagnostic patterns associated with coronary artery disease.
* **Clinical Setting:** Outpatient clinic triage, secondary screening prioritization, and simulated medical student training.

### 2.4 Explicit Exclusions & Prohibited Uses
* ❌ **NOT a 10-Year Cardiovascular Event Predictor:** The Cleveland dataset records existing cross-sectional angiographic findings; it does NOT estimate future 10-year myocardial infarction or stroke probability (which is handled separately by our Framingham ASCVD module).
* ❌ **NOT an Autonomous Diagnostic Tool:** The model output shall never replace formal coronary angiography, CT calcium scoring, or physician consultation.
* ❌ **NO Medication Directives:** The system will not recommend statin initiation, anti-platelet therapy, or dosage titration based on model outputs.

### 2.5 Approved User-Facing Prediction Wording
* **Positive Classification ($Y=1$):**  
  `"Indicators Suggestive of Significant Coronary Artery Disease Pattern"`
* **Negative Classification ($Y=0$):**  
  `"Clinical Pattern Not Suggestive of Significant Coronary Artery Disease"`
* **Mandatory Accompanying Disclaimer:**  
  *"EDUCATIONAL PROTOTYPE ONLY. This statistical assessment evaluates cross-sectional physiological patterns based on the UCI Cleveland benchmark. It is NOT a clinical diagnosis and does NOT estimate future heart attack risk. Please consult a licensed cardiologist."*

---

## 3. Problem Statement 2: Diabetes Status Classification (CDC BRFSS Indicators)

### 3.1 Clinical & Technical Problem Statement
Given a structured vector of 21 self-reported survey indicators encompassing lifestyle habits (exercise, diet, alcohol, smoking), metabolic history (hypertension, cholesterol), and general health status, classify whether an individual reports a medical diagnosis of Diabetes or Prediabetes.

### 3.2 Mathematical Target Formulation
* **Formulated Target Variable (`Diabetes_binary`):** Binary classification
  $$Y_{\text{diabetes}} = \begin{cases} 0 & \text{No Diabetes Reported} \\ 1 & \text{Diagnosed Prediabetes or Diabetes Reported} \end{cases}$$

### 3.3 Intended Use
* **Primary Intended Use:** Population-level health risk awareness, non-invasive digital screening triage, and encouraging at-risk individuals to undergo formal venous plasma glucose or Glycated Hemoglobin ($\text{HbA}_{1c}$) diagnostic blood tests.
* **Target Audience:** Outpatient portal self-screening and community health awareness drives.

### 3.4 Explicit Exclusions & Prohibited Uses
* ❌ **NOT a Diagnostic Blood Glucose Test:** The model classifies self-reported survey traits, not biochemical glycemic measurements ($\text{HbA}_{1c}$, Oral Glucose Tolerance Test).
* ❌ **NOT a Distinguisher between Type-1 and Type-2 Diabetes:** The survey does not differentiate insulin-dependent autoimmune Type 1 diabetes from lifestyle-mediated Type 2 diabetes.
* ❌ **NOT an Ingestion Directive:** Under no circumstances shall the platform suggest insulin or metformin therapies.

### 3.5 Approved User-Facing Prediction Wording
* **Positive Classification ($Y=1$):**  
  `"Elevated Behavioral & Metabolic Profile Consistent with Diabetes Risk"`
* **Negative Classification ($Y=0$):**  
  `"Reported Profile Currently Not Indicative of Elevated Diabetes Risk"`
* **Mandatory Accompanying Disclaimer:**  
  *"SCREENING AID ONLY. This feature assesses survey-based lifestyle and metabolic indicators. It does NOT measure blood sugar and cannot confirm diabetes. Individuals with symptoms or elevated risk should obtain fasting blood glucose and HbA1c tests from a medical laboratory."*

---

## 4. Key Differences: Machine Learning Classification vs. Clinical Risk Scoring

| Dimension | ML Prototype Classification (Sprint 1–6) | Clinical Risk Calculators (Existing Sprint 6) |
|---|---|---|
| **Algorithms** | Logistic Regression, Decision Trees, Random Forest | Framingham Cox Regression, FINDRISC Additive Points |
| **Data Basis** | UCI Cleveland (303 rows), CDC BRFSS (253,680 rows) | Epidemiological Cohort Studies (NHLBI, Finnish Public Health) |
| **Output Type** | Binary class probability ($P(Y=1 \mid X)$) | Prospective 10-Year percentage incidence rate ($P(\text{Event in 10 yrs})$) |
| **Validation Base** | Cross-validation, test-set classification metrics | Decades of prospective clinical randomized cohort follow-ups |
| **Clinical Goal** | Pattern classification & anomaly detection | Population preventive therapy titration thresholds |

---

## 5. Sign-Off & Acceptance Status
* **Sprint 1 Task Status:** ML1-01 (Done), ML1-02 (Done), ML1-10 (Done)
* **Approved Date:** 2026-11-10
* **Next Dependency:** Data Dictionary (`Docs/ml/data_dictionary.md`) and Dataset Cards.
