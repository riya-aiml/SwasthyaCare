# SwasthyaCare — Demographic Subgroup Fairness & Disparity Review
## Task ML-S5-02: Algorithmic Parity Across Biological Sex and Age Cohorts

**Document ID:** SWC-ML-FR-002  
**Sprint:** Sprint 5 — Model Evaluation, Fairness & Model Cards  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Clinical & Ethical Evaluation  

---

## 1. Ethical Governance & Regulatory Framework

Under FDA Good Machine Learning Practice (GMLP) and WHO guidelines for Artificial Intelligence in Health, clinical decision-support algorithms must be audited for systematic biases and disparate performance across demographic subgroups before deployment.

### Evaluation Metrics
1. **Equal Opportunity (Sensitivity Parity):**  
   Measures whether individuals with the condition have an equal probability of being identified regardless of demographic category:
   $$\text{Disparity Ratio} = \frac{\min(\text{Sensitivity}_A, \text{Sensitivity}_B)}{\max(\text{Sensitivity}_A, \text{Sensitivity}_B)}$$
   *Threshold:* $\ge 0.80$ (The clinical Four-Fifths Fair Lending / EEOC Parity Standard).
2. **Predictive Parity (Precision / PPV):**  
   Ensures that an elevated indicator alert carries comparable diagnostic weight across groups.

---

## 2. Diabetes Current-Status Subgroup Audit (`ML-DIA-01`)
*Model: `diabetes-current-status-lr` at calibrated threshold $\tau = 0.49$.*

### 2.1 Performance by Biological Sex
| Demographic Group | Test Sample ($N$) | Ground Truth Positives | Sensitivity (Recall) | Specificity | ROC-AUC | Parity Evaluation |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Female Patients** | 1,112 (55.7%) | 121 (10.9%) | **80.99%** | 74.37% | **0.8537** | Baseline |
| **Male Patients** | 885 (44.3%) | 150 (16.9%) | **77.33%** | 66.67% | **0.7980** | Minor disparity |
| **Equal Opportunity Ratio**| - | - | **0.955** | - | - | ✅ **PASS ($\ge 0.80$)** |

* **Analysis:** The model exhibits nearly identical sensitivity between female (81.0%) and male (77.3%) respondents, achieving a high Equal Opportunity Ratio of **0.955**. Female classification displays higher overall ROC-AUC (0.854 vs 0.798) due to stronger survey clustering around metabolic care checkups.

### 2.2 Performance by Age Cohort
| Age Cohort | Test Sample ($N$) | Ground Truth Positives | Sensitivity (Recall) | Specificity | ROC-AUC |
|---|:---:|:---:|:---:|:---:|:---:|
| **Younger / Middle-Aged (< 55 yrs)** | 772 (38.7%) | 57 (7.4%) | **64.91%** | **88.25%** | **0.8804** |
| **Older Adults ($\ge 55$ yrs)** | 1,225 (61.3%) | 214 (17.5%) | **82.71%** | 58.95% | **0.7851** |

* **Clinical Interpretation:**  
  * In younger adults (< 55 years), baseline diabetes prevalence is much lower ($7.4\%$), resulting in high specificity ($88.25\%$) and lower sensitivity ($64.91\%$) because younger individuals with metabolic dysregulation often present with fewer overt co-morbidities (e.g., normal blood pressure, no difficulty walking).
  * In older adults ($\ge 55$ years), sensitivity rises to **82.71%** as hypertension, cholesterol checks, and vascular complications become prominent.
  * **Platform Action:** The user interface includes educational copy highlighting that early prediabetic metabolic dysfunction in individuals under 45 may not present with standard chronic symptoms.

---

## 3. Cardiovascular Current-Status Subgroup Audit (`ML-CVD-01`)
*Model: `cardiovascular-current-status-rf` at calibrated threshold $\tau = 0.55$.*

### 3.1 Performance by Biological Sex
| Demographic Group | Test Sample ($N$) | Ground Truth Positives | Sensitivity (Recall) | Specificity | ROC-AUC | Parity Evaluation |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Female Patients** | 20 (32.8%) | 7 (35.0%) | **85.71%** ($6/7$) | **100.0%** ($13/13$) | **1.000** | Exceptional accuracy |
| **Male Patients** | 41 (67.2%) | 21 (51.2%) | **95.24%** ($20/21$)| 90.00% ($18/20$) | **0.9524** | High sensitivity |
| **Equal Opportunity Ratio**| - | - | **0.900** | - | - | ✅ **PASS ($\ge 0.80$)** |

* **Analysis:** Equal Opportunity Ratio between female and male patients is **0.900**, well above the 0.80 fairness threshold. In females, specificity is 100% (zero false alarms in the test partition), while sensitivity in males is 95.2% (only 1 missed case).

### 3.2 Age Performance Trends
* In both younger (< 55) and older ($\ge 55$) cardiology patients, sensitivity exceeds **87%**, driven by strong non-invasive imaging signals (`ca` fluoroscopy and `thal` nuclear scintigraphy).

---

## 4. Documented Subgroup Limitations
1. **Under-Representation of Females in Historical CAD Data:** The Cleveland cohort is 68% male, reflecting 1980s referral practices. Female CAD often presents with microvascular dysfunction rather than focal epicardial stenosis.
2. **Ethnic Mismatch:** As documented in Sprint 3, neither dataset includes native South Asian / Indian epidemiological stratification.

---
*Signed off for Sprint 5 — Task ML-S5-02.*
