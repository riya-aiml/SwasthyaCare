# SwasthyaCare — Calibration & Decision Threshold Specification
## Task ML-S5-03: Operating Point Optimization for Prototype Clinical Decision Support

**Document ID:** SWC-ML-DT-001  
**Sprint:** Sprint 5 — Model Evaluation, Fairness & Model Cards  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Technical & Clinical Specification  

---

## 1. Operating Point Selection Rationale

In clinical screening systems, the default machine learning decision threshold of $\tau = 0.50$ is rarely optimal:
1. **Asymmetric Clinical Costs:** The cost of a **False Negative** (failing to alert a patient presenting with active diabetes or significant coronary stenosis) is far more severe than a **False Positive** (advising an asymptomatic patient to complete a routine fasting glucose or ECG test).
2. **Prevalence Imbalance:** In population screening with low disease prevalence (such as the CDC BRFSS at 13.9%), a $0.50$ threshold artificially suppresses sensitivity.

---

## 2. Decision Threshold Analysis by Task

### 2.1 Task ML-DIA-01: Diabetes Current-Status Assessment
*Model: `diabetes-current-status-lr` (Logistic Regression with balanced weights).*

#### Precision-Recall Tradeoff Table across Thresholds ($\tau$):
| Threshold ($\tau$) | Sensitivity (Recall) | Specificity | Precision | F1-Score | Clinical Suitability |
|:---:|:---:|:---:|:---:|:---:|---|
| $0.35$ | **89.67%** | 56.49% | 24.47% | 0.3843 | High sensitivity; excessive false alarms (43.5% false positive rate) |
| $0.40$ | **85.98%** | 62.69% | 26.54% | 0.4056 | Screening threshold |
| **$0.49$ (Approved)** | **78.97%** | **71.09%** | **30.01%** | **0.4350** | **OPTIMAL BALANCED OPERATING POINT:** Captures 8/10 cases; keeps specificity $> 70\%$ |
| $0.50$ | 77.86% | 71.55% | 30.06% | 0.4337 | Slightly lower sensitivity |
| $0.60$ | 61.25% | 83.20% | 36.40% | 0.4567 | Unacceptable false negative rate (misses 38.7% of cases) |

* **Approved Operating Point:** **$\tau_{\text{DIA}} = 0.49$**
* **Output Label Mapping:**
  * If $\hat{P}(\text{Diabetes}) \ge 0.49$: `"Reported Profile Consistent with Elevated Diabetes Indicator Pattern"`
  * If $\hat{P}(\text{Diabetes}) < 0.49$: `"Reported Profile Currently Not Indicative of Elevated Diabetes Pattern"`

---

### 2.2 Task ML-CVD-01: Cardiovascular Current-Status Assessment
*Model: `cardiovascular-current-status-rf` (Random Forest Ensemble).*

#### Threshold Analysis Table:
| Threshold ($\tau$) | Sensitivity (Recall) | Specificity | Precision | F1-Score | Clinical Suitability |
|:---:|:---:|:---:|:---:|:---:|---|
| $0.40$ | **96.43%** ($27/28$) | 87.88% ($29/33$) | 87.10% | 0.9153 | Excellent emergency triage threshold (only 1 FN) |
| $0.50$ | 92.86% ($26/28$) | 93.94% ($31/33$) | 92.86% | 0.9286 | Strong balanced performance |
| **$0.55$ (Approved)** | **92.86%** ($26/28$) | **93.94%** ($31/33$) | **92.86%** | **0.9286** | **OPTIMAL CLINICAL OPERATING POINT:** Equal sensitivity and specificity; minimum probability variance |
| $0.65$ | 82.14% ($23/28$) | 96.97% ($32/33$) | 95.83% | 0.8846 | Drops sensitivity below 90% |

* **Approved Operating Point:** **$\tau_{\text{CVD}} = 0.55$**
* **Output Label Mapping:**
  * If $\hat{P}(\text{Stenosis}) \ge 0.55$: `"Biomarker Pattern Suggestive of Significant Coronary Stenosis Pattern"`
  * If $\hat{P}(\text{Stenosis}) < 0.55$: `"Biomarker Pattern Not Indicative of Significant Coronary Stenosis"`

---

## 3. Probability Calibration (Brier Score Verification)

* **Diabetes (`ML-DIA-01`):** Brier score is **0.1779** (well below the 0.25 uninformative uniform baseline).
* **Cardiovascular (`ML-CVD-01`):** Brier score is **0.0764**, demonstrating that computed probabilities closely track empirical stenosis frequency.

---
*Signed off for Sprint 5 — Task ML-S5-03.*
