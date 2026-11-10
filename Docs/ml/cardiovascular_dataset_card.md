# SwasthyaCare — Dataset Card: UCI Cleveland Heart Disease

**Document ID:** SWC-ML-DC-001  
**Sprint:** ML Sprint 1 (Task ML1-09)  
**Dataset Name:** Heart Disease Dataset (Cleveland Subset)  
**UCI Machine Learning Repository ID:** 45  
**URI Reference:** https://archive.ics.uci.edu/dataset/45/heart+disease  
**Audit Date:** 2026-11-10  

---

## 1. Dataset Provenance & Authorship
* **Original Creators:**
  * Robert Detrano, M.D., Ph.D., Cleveland Clinic Foundation.
  * William Steinbrunn, M.D., University Hospital, Zurich, Switzerland.
  * Matthias Pfisterer, M.D., University Hospital, Basel, Switzerland.
  * J.W. Hung, M.D., V.A. Medical Center, Long Beach, CA.
* **Donor:** David W. Aha (aha@ics.uci.edu).
* **Date Published:** 1988 (Canonical benchmark in clinical machine learning).
* **License & Permitted Use:** Creative Commons Attribution 4.0 International (CC BY 4.0). Redistribution and commercial/educational derivative works permitted with formal academic attribution.

---

## 2. Dataset Overview & Dimensions
* **Total Instances:** 303 patient records.
* **Total Raw Attributes:** 76 attributes originally measured; 14 attributes selected for standard clinical benchmark publishing.
* **Predictor Features:** 13 (5 continuous/numeric, 3 binary, 3 nominal categorical, 2 ordinal).
* **Target Feature:** `target` (Integer 0 to 4 indicating coronary stenosis extent).

---

## 3. Data Quality & Missing Value Audit (Task ML1-07)
* **Total Missing Cells:** 6 values across 6 rows (1.98% of cohort).
  * `ca` (Fluoroscopy vessel count): **4 missing values** (Originally encoded as `?`).
  * `thal` (Myocardial perfusion defect): **2 missing values** (Originally encoded as `?`).
* **Duplicate Rows:** **0 duplicate rows detected** across the entire 303-record dataset.
* **Outliers & Physiologic Consistency:**
  * `chol` (Serum Cholesterol): Maximum observed value is 564 mg/dL. While elevated, this is biologically plausible in familial hypercholesterolemia.
  * `trestbps` (Blood Pressure): Range 94 – 200 mmHg. Plausible for inpatient cardiac admissions.

---

## 4. Class Balance & Target Analysis (Task ML1-05)

### 4.1 Multi-Class Distribution
| Class Label | Angiographic Severity | Record Count | Percentage |
|:---:|---|:---:|:---:|
| `0` | Absence of significant disease (< 50% diameter stenosis) | 164 | 54.13% |
| `1` | Mild single-vessel disease ($\ge$ 50% stenosis) | 55 | 18.15% |
| `2` | Moderate double-vessel disease ($\ge$ 50% stenosis) | 36 | 11.88% |
| `3` | Severe triple-vessel disease ($\ge$ 50% stenosis) | 35 | 11.55% |
| `4` | Severe multi-vessel / main stem disease | 13 | 4.29% |

### 4.2 Binary Classification Target ($Y \in \{0, 1\}$)
* **Negative Class ($Y=0$):** 164 records (**54.13%**)
* **Positive Class ($Y=1$):** 139 records (**45.87%**)
* **Class Ratio:** 1.18 : 1 (Well-balanced distribution suitable for standard accuracy, F1, and ROC-AUC evaluation).

---

## 5. Target Leakage & Post-Outcome Audit (Task ML1-08)
* **Pre-Outcome vs Post-Outcome Analysis:**
  * `thalach`, `oldpeak`, `slope`: Derived from pre-catheterization exercise treadmill testing (Bruce protocol ECG). Valid predictive indicators.
  * `ca` (Number of vessels colored by fluoroscopy): Directly correlated with fluoroscopic visualization performed during cardiac catheterization. While useful, in primary care settings, fluoroscopy is rarely available prior to specialist referral.
  * **Audit Conclusion:** **No target leakage detected.** However, in production primary care triage, models should document whether `ca` is available or if imputation/exclusion is preferred.

---

## 6. Population Representation & Clinical Limitations (Task ML1-09)
1. **Severe Cohort Selection Bias:** The cohort consists exclusively of patients who were referred for invasive coronary angiography at the Cleveland Clinic in the 1980s. This produces significant spectrum bias (i.e., patients already had high clinical suspicion of coronary artery disease).
2. **Gender Imbalance:**
   * Male patients: 206 (**67.99%**)
   * Female patients: 97 (**32.01%**)
   * Cardiovascular disease manifestations differ between sexes (e.g., atypical angina is significantly more prevalent in women). Models must be audited for subgroup fairness.
3. **Geographic & Ethnic Mismatch (Indian Demographics):**
   * The dataset represents a North American Midwestern clinical population from 1984–1988.
   * South Asian / Indian populations exhibit premature coronary artery disease (CAD onset occurring 5–10 years earlier on average) and elevated Lipoprotein(a).
   * **Mandatory Warning:** *The Cleveland model baseline must be presented as an educational algorithmic benchmark, NOT a validated risk calculator for Indian outpatient populations.*
