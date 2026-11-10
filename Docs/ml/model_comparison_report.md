# SwasthyaCare — Model Comparison & Selection Report
## Task ML-S5-01: Algorithmic Selection Rationale for Active Current-Status Tasks

**Document ID:** SWC-ML-MC-001  
**Sprint:** Sprint 5 — Model Evaluation, Fairness & Model Cards  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Technical Evaluation  

---

## 1. Executive Summary

In conformance with Task `ML-S5-01`, this report delivers the formal comparative evaluation between linear models (Regularized Logistic Regression with balanced weighting) and non-linear ensemble models (Random Forest Classifiers) across both active current-status tasks:
* **Task `ML-DIA-01` (Diabetes Current-Status Assessment):**
  * Selected Algorithm: **Logistic Regression with Balanced Class Weighting** (`diabetes-current-status-lr`).
  * Selection Justification: Delivers higher discriminative performance (**ROC-AUC: 0.8292** vs. 0.8250 for Random Forest), superior probability calibration (Brier Score: 0.1779), and direct clinical explainability via log-odds coefficients.
* **Task `ML-CVD-01` (Cardiovascular Current-Status Assessment):**
  * Selected Algorithm: **Random Forest Ensemble** (`cardiovascular-current-status-rf`).
  * Selection Justification: Captures complex non-linear hemodynamic-ECG interactions, outperforming the linear baseline (**ROC-AUC: 0.9675** vs. 0.9567, **PR-AUC: 0.9562** vs. 0.9368, **Sensitivity: 92.86%** vs. 89.29%).

---

## 2. Diabetes Current-Status Comparison (`ML-DIA-01`)

### 2.1 Full Statistical Comparison Table
*Held-out test partition: $N_{\text{test}} = 1,997$ records from CDC BRFSS 2015.*

| Evaluation Dimension | Logistic Regression Baseline (Selected) | Random Forest Ensemble (Comparison) | Winner & Clinical Rationale |
|---|:---:|:---:|---|
| **ROC-AUC** | **0.8292** | 0.8250 | **Logistic Regression (+0.0042)** |
| **PR-AUC (Average Precision)**| **0.4291** | 0.4233 | **Logistic Regression (+0.0058)** ($>3\times$ prevalence) |
| **Sensitivity (Recall)** | **78.97%** ($214 / 271$) | 75.65% ($205 / 271$) | **Logistic Regression (+3.32%)** (Captures more cases) |
| **Specificity** | 71.09% ($1227 / 1726$) | **73.93%** ($1276 / 1726$) | Random Forest (+2.84%) |
| **Precision (PPV)** | 30.01% | **31.30%** | Random Forest (+1.29%) |
| **F1-Score** | 0.4350 | **0.4428** | Random Forest (+0.0078) |
| **Brier Score (Calibration)** | **0.1779** | 0.1792 | **Logistic Regression** (Lower probability error) |
| **Inference Latency (p99)** | **< 1.5 ms** | 12.4 ms | **Logistic Regression ($8\times$ faster)** |
| **Model Artifact Size** | **7.3 KB** | 3.8 MB | **Logistic Regression ($500\times$ smaller)** |
| **Clinical Interpretability** | Transparent Log-Odds Multipliers | Opaque Ensembled Splits | **Logistic Regression** |

### 2.2 Architectural Decision
**Logistic Regression (`diabetes-current-status-lr`) is approved as the production model for `ML-DIA-01`.**  
In large-scale population screening ($N \approx 250,000$), linear combinations of self-reported survey indicators provide equivalent or superior discriminative power compared to deep decision forests while eliminating black-box opacity and guaranteeing instant sub-millisecond inference on low-power infrastructure.

---

## 3. Cardiovascular Current-Status Comparison (`ML-CVD-01`)

### 3.1 Full Statistical Comparison Table
*Held-out test partition: $N_{\text{test}} = 61$ records from UCI Cleveland Catheterization Benchmark.*

| Evaluation Dimension | Logistic Regression Baseline | Random Forest Ensemble (Selected) | Winner & Clinical Rationale |
|---|:---:|:---:|---|
| **ROC-AUC** | 0.9567 | **0.9675** | **Random Forest (+0.0108)** |
| **PR-AUC (Average Precision)**| 0.9368 | **0.9562** | **Random Forest (+0.0194)** |
| **Sensitivity (Recall)** | 89.29% ($25 / 28$) | **92.86%** ($26 / 28$) | **Random Forest (+3.57%)** (Only 2 false negatives) |
| **Specificity** | **96.97%** ($32 / 33$) | 93.94% ($31 / 33$) | Logistic Regression (+3.03%) |
| **Precision (PPV)** | **96.15%** ($25 / 26$) | 92.86% ($26 / 28$) | Logistic Regression (+3.29%) |
| **F1-Score** | 0.9259 | **0.9286** | **Random Forest (+0.0027)** |
| **Brier Score (Calibration)** | 0.0881 | **0.0764** | **Random Forest** (Superior probability calibration) |
| **Inference Latency (p99)** | **< 1.0 ms** | 3.2 ms | Both well within 50 ms budget |
| **Model Artifact Size** | **6.8 KB** | 352 KB | Both easily cacheable in memory |
| **Interaction Modeling** | Linear Additive | Non-linear ECG-Vitals Trees | **Random Forest** |

### 3.2 Architectural Decision
**Random Forest (`cardiovascular-current-status-rf`) is approved as the production model for `ML-CVD-01`.**  
Coronary artery disease diagnostic presentation involves critical non-linear physiological interactions (e.g., exercise-induced ST depression occurring simultaneously with reversible thallium perfusion defects and chronotropic incompetence). Random Forest decision trees naturally partition these multivariate multi-modality signals, yielding a near-perfect ROC-AUC of **0.9675** and missing only 2 cases out of 28 positive patients in the test partition.

---
*Signed off for Sprint 5 — Task ML-S5-01.*
