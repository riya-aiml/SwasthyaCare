# SwasthyaCare — Dataset Card: UCI CDC Diabetes Health Indicators

**Document ID:** SWC-ML-DC-002  
**Sprint:** ML Sprint 1 (Task ML1-09)  
**Dataset Name:** CDC Diabetes Health Indicators (BRFSS 2015 Subset)  
**UCI Machine Learning Repository ID:** 891  
**URI Reference:** https://archive.ics.uci.edu/dataset/891/cdc+diabetes+health+indicators  
**Audit Date:** 2026-11-10  

---

## 1. Dataset Provenance & Authorship
* **Original Creators:** Centers for Disease Control and Prevention (CDC), Division of Population Health, Atlanta, GA, USA.
* **Source Survey:** Behavioral Risk Factor Surveillance System (BRFSS), 2015 Annual Survey Data.
* **Curator / Donor:** Alex Teboul (University of Virginia, School of Data Science, 2021).
* **Date Published:** 2021 in UCI ML Repository.
* **License & Permitted Use:** Public Domain (U.S. Federal Government Works / CC0). Permitted for non-commercial and commercial derivative research without restriction.

---

## 2. Dataset Overview & Dimensions
* **Total Instances:** 253,680 survey respondents.
* **Total Attributes:** 22 (21 predictor features + 1 target).
* **Predictor Types:**
  * 13 Binary indicators (`HighBP`, `HighChol`, `Smoker`, `Stroke`, `HeartDiseaseorAttack`, `PhysActivity`, `Fruits`, `Veggies`, `HvyAlcoholConsump`, `AnyHealthcare`, `NoDocbcCost`, `DiffWalk`, `Sex`).
  * 5 Ordinal categorical features (`GenHlth`, `Age`, `Education`, `Income`, `CholCheck`).
  * 3 Numeric / Continuous features (`BMI`, `MentHlth`, `PhysHlth`).
* **Target Feature:** `Diabetes_binary` (Binary indicator: `0.0` = No Diabetes, `1.0` = Prediabetes or Diabetes).

---

## 3. Data Quality & Missing Value Audit (Task ML1-07)
* **Total Missing Cells:** **0 missing values** across all 253,680 rows (Data was pre-cleaned during CDC BRFSS processing).
* **Duplicate Rows:** **24,206 duplicate rows detected (9.54%)**.
  * *Root Cause Analysis:* BRFSS is a discrete telephone survey with 21 categorical/coarse features. Across 253,680 responses, numerous healthy individuals share identical demographic vectors (e.g., Male, Age 30–34, No High BP, No High Cholesterol, BMI 25, Active, Non-Smoker).
  * *Treatment Strategy for ML Sprint 2:* Do NOT blindly drop duplicates as they reflect real population density in survey epidemiology; verify that duplicates do not cross train/test splits.

---

## 4. Class Balance & Target Analysis (Task ML1-05)

| Class Label | Clinical Meaning | Instance Count | Percentage |
|:---:|---|:---:|:---:|
| `0.0` | Negative (No Diabetes Reported) | 218,334 | **86.07%** |
| `1.0` | Positive (Reported Prediabetes or Diabetes) | 35,346 | **13.93%** |

* **Class Imbalance Ratio:** **6.18 : 1**
* **Engineering Impact:**
  * A naive model that classifies every patient as `0` achieves **86.07% Accuracy**, while having **0% Recall** on diabetic individuals.
  * In ML Sprints 3 & 4, models must be evaluated using **Precision-Recall AUC (PR-AUC)**, **Balanced Accuracy**, **Recall (Sensitivity)**, and **F1-Score**.
  * Training will use `class_weight='balanced'` or stratified downsampling.

---

## 5. Target Leakage & Socioeconomic Feature Audit (Task ML1-08)
* **Self-Reported Diagnosis Bias:**
  * The target records self-reported physician diagnosis (*"Have you ever been told..."*). Individuals with undiagnosed diabetes will be categorized as `0` unless tested.
* **Healthcare Access Artifacts:**
  * Features `AnyHealthcare` and `NoDocbcCost` represent economic barriers. Uninsured individuals have lower detection rates, potentially artificially suppressing diabetes counts in lower income brackets.
  * **Audit Conclusion:** Models should identify `HighBP`, `HighChol`, `BMI`, and `GenHlth` as biological drivers, rather than relying excessively on healthcare insurance status.

---

## 6. Population Representation & Geographic Mismatch (Task ML1-09)
* **Demographic Context:** Represents non-institutionalized U.S. adult population residing in all 50 states surveyed via landline and cellular telephones.
* **Dietary & Lifestyle Patterns:** Features such as `Fruits` and `Veggies` reflect American dietary standards; `HvyAlcoholConsump` uses US NIAAA guidelines.
* **Body Mass Index (BMI) Threshold Differences:**
  * In Caucasian cohorts, overweight is classified as $\text{BMI} \ge 25$ and obesity as $\text{BMI} \ge 30$.
  * According to the **World Health Organization (WHO) South Asian guidelines**, the risk thresholds are lower ($\text{BMI} \ge 23$ for overweight, $\text{BMI} \ge 27.5$ for obesity) due to higher visceral adiposity.
* **Mandatory Warning:** *The CDC diabetes model reflects U.S. population health survey statistics. Clinical adaptation for Indian outpatient facilities requires calibrating BMI thresholds to South Asian metabolic guidelines.*
