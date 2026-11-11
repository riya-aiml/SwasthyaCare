# SwasthyaCare Application Knowledge: AI Risk Screening & Decision Support
**Document ID:** SWC-APP-03  
**Category:** ai_models  
**Target Scope:** Scope A (Application Help)  

## 1. AI Decision Support Overview
* SwasthyaCare provides machine learning screening engines for preventive metabolic and cardiovascular health under the **AI Risk Scoring** tab.
* **SaMD Regulatory Notice:** These engines are non-diagnostic decision-support prototypes. They do NOT replace medical diagnosis or laboratory blood tests.

## 2. Diabetes Indicator Screening (Task ML-DIA-01)
* **Model Engine:** Calibrated Logistic Regression model ($C=1.0$) trained on CDC BRFSS benchmark data.
* **Input Parameters:** 21 self-reported lifestyle and health survey factors (including BMI, high blood pressure history, physical activity, and dietary habits).
* **Calibrated Decision Threshold:** $\tau = 0.49$.
* **Classification Output:**
  * Positive: *"Reported Profile Consistent with Elevated Diabetes Indicator Pattern"*.
  * Negative: *"Reported Profile Consistent with Standard Survey Indicator Pattern"*.
* **Clinical Next Step:** Patients with elevated scores are recommended to consult their physician for formal fasting plasma glucose and HbA1c diagnostic testing.

## 3. Cardiovascular Stenosis Screening (Task ML-CVD-01)
* **Model Engine:** Calibrated Random Forest Classifier (100 trees, max depth 5) trained on the UCI Cleveland catheterization benchmark.
* **Input Parameters:** 13 diagnostic treadmill and catheterization biomarkers (including resting blood pressure, serum cholesterol, exercise-induced angina, and ST depression).
* **Calibrated Decision Threshold:** $\tau = 0.55$.
* **Classification Output:**
  * Identifies whether hemodynamic markers are suggestive of significant ($\ge 50\%$) coronary stenosis.

## 4. 10-Year Prospective ASCVD Risk Calculator
* For estimating prospective 10-year heart attack and stroke risk, SwasthyaCare integrates the clinically validated **Framingham ASCVD Risk Engine**, calculating gender-specific lipid and non-lipid risk percentages.
