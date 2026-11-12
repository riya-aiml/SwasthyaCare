---
id: DOC-PLAT-03
title: SwasthyaCare Machine Learning Risk Models & Clinical Decision Support Documentation
category: platform_documentation
source_organization: SwasthyaCare Platform
version: 1.0.0
last_reviewed: 2026-11-12
---

# SwasthyaCare AI Risk Estimation Models

## 1. Model Overview & SaMD Boundaries
SwasthyaCare provides statistical screening and decision support prototypes under Software as a Medical Device (SaMD) investigational protocols. These statistical estimators are designed to assist preventive screening and DO NOT formulate definitive medical diagnoses.

## 2. Cardiovascular Risk Model (`ML-CVD-01`)
- **Methodology:** Calibrated Framingham Risk Profile and supervised gradient boosted decision trees trained on multi-factor cardiac indicators.
- **Key Inputs:** Age, gender, systolic blood pressure, total cholesterol, HDL cholesterol, smoking status, and diabetic status.
- **Output Stratification:**
  - `< 10%`: Low 10-year cardiovascular risk
  - `10% - 19.9%`: Intermediate risk (lifestyle modifications and clinical review indicated)
  - `≥ 20%`: High risk (requires formal clinical diagnostic workup, lipid profile confirmation, and physician evaluation).

## 3. Diabetes Risk Model (`ML-DIA-01`)
- **Methodology:** Finnish Diabetes Risk Score (FINDRISC) framework tailored for South Asian metabolic phenotypes.
- **Key Inputs:** Age, BMI, waist circumference, physical activity (minutes/day), daily vegetable/fruit intake, history of elevated blood pressure, and family history of diabetes.
- **Output Stratification:**
  - `0 - 7 points`: Low risk (~1% 10-year probability)
  - `7 - 14 points`: Moderate risk (~10% 10-year probability)
  - `15+ points`: High risk (~33%+ 10-year probability; formal laboratory fasting plasma glucose and HbA1c testing strongly advised).
