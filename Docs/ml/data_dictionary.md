# SwasthyaCare — ML Sprint 1: Comprehensive Data Dictionary

**Document ID:** SWC-ML-DD-001  
**Sprint:** ML Sprint 1 (Task ML1-06)  
**Version:** 1.0.0  
**Project:** SwasthyaCare — AI-Assisted Clinical Workflow & Risk Assessment System  

---

## 1. Cardiovascular Dataset Data Dictionary (UCI Cleveland Subset)

* **Source File:** `ai-service/data/cardiovascular/processed.cleveland.data`
* **Total Instances:** 303 | **Total Features:** 13 Predictors + 1 Target

| # | Feature Name | Clinical Description | Data Type | Units / Encoding | Valid Clinical Range | Null / Missing Count |
|:---:|---|---|---|---|:---:|:---:|
| 1 | `age` | Patient chronological age | Numeric (Float) | Years | 29.0 – 77.0 | 0 (0.0%) |
| 2 | `sex` | Biological sex | Categorical (Binary) | `1.0` = Male<br>`0.0` = Female | {0, 1} | 0 (0.0%) |
| 3 | `cp` | Chest pain type reported | Categorical (Nominal) | `1.0` = Typical Angina<br>`2.0` = Atypical Angina<br>`3.0` = Non-anginal Pain<br>`4.0` = Asymptomatic | {1, 2, 3, 4} | 0 (0.0%) |
| 4 | `trestbps` | Resting systolic blood pressure upon hospital admission | Numeric (Float) | mmHg | 94.0 – 200.0 | 0 (0.0%) |
| 5 | `chol` | Serum total cholesterol level | Numeric (Float) | mg/dL | 126.0 – 564.0 | 0 (0.0%) |
| 6 | `fbs` | Fasting blood sugar level | Categorical (Binary) | `1.0` = Fasting BS > 120 mg/dL<br>`0.0` = Fasting BS $\le$ 120 mg/dL | {0, 1} | 0 (0.0%) |
| 7 | `restecg` | Resting electrocardiographic results | Categorical (Nominal) | `0.0` = Normal<br>`1.0` = ST-T wave abnormality (T wave inversions / ST elevation > 0.05 mV)<br>`2.0` = Probable/definite left ventricular hypertrophy (Estes criteria) | {0, 1, 2} | 0 (0.0%) |
| 8 | `thalach` | Maximum heart rate achieved during treadmill exercise | Numeric (Float) | Beats per minute (bpm) | 71.0 – 202.0 | 0 (0.0%) |
| 9 | `exang` | Exercise-induced angina pectoris | Categorical (Binary) | `1.0` = Yes (Angina induced by exertion)<br>`0.0` = No | {0, 1} | 0 (0.0%) |
| 10 | `oldpeak` | ST depression induced by exercise relative to rest | Numeric (Float) | Millimeters (mm) | 0.0 – 6.2 | 0 (0.0%) |
| 11 | `slope` | Slope of the peak exercise ST segment | Categorical (Ordinal) | `1.0` = Upsloping<br>`2.0` = Flat<br>`3.0` = Downsloping | {1, 2, 3} | 0 (0.0%) |
| 12 | `ca` | Number of major coronary vessels colored by fluoroscopy | Numeric / Ordinal | Count of vessels (0 – 3) | 0.0 – 3.0 | **4 (1.3%)** *(Imputation required)* |
| 13 | `thal` | Thallium-201 myocardial scintigraphy perfusion status | Categorical (Nominal) | `3.0` = Normal perfusion<br>`6.0` = Fixed defect (prior infarction)<br>`7.0` = Reversible defect (ischemia) | {3, 6, 7} | **2 (0.7%)** *(Imputation required)* |
| **T** | `target` | Angiographic coronary disease status (> 50% stenosis) | Integer (Target) | `0` = Absence (< 50% stenosis)<br>`1, 2, 3, 4` = Presence ($\ge$ 50% stenosis) | {0, 1, 2, 3, 4} | 0 (0.0%) |

---

## 2. Diabetes Indicators Dataset Data Dictionary (UCI CDC BRFSS 2015)

* **Source File:** `ai-service/data/diabetes/diabetes_health_indicators.csv`
* **Total Instances:** 253,680 | **Total Features:** 21 Predictors + 1 Target

| # | Feature Name | Description & Survey Item Prompt | Data Type | Units / Encoding Values | Missing Count |
|:---:|---|---|---|---|:---:|
| **T** | `Diabetes_binary` | **Target:** Has a doctor or nurse ever told you that you have diabetes? | Binary (Target) | `0.0` = No diabetes<br>`1.0` = Prediabetes or Diabetes | 0 (0.0%) |
| 1 | `HighBP` | Have you ever been told by a doctor that you have high blood pressure? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 2 | `HighChol` | Have you EVER been told by a doctor that your blood cholesterol is high? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 3 | `CholCheck` | Cholesterol check performed within the past five years? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 4 | `BMI` | Body Mass Index calculated as $\text{Weight (kg)} / \text{Height (m)}^2$ | Numeric | kg/m² (Observed range: 12.0 – 98.0) | 0 (0.0%) |
| 5 | `Smoker` | Have you smoked at least 100 cigarettes in your entire life? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 6 | `Stroke` | Were you ever told you had a stroke? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 7 | `HeartDiseaseorAttack` | History of coronary heart disease or myocardial infarction? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 8 | `PhysActivity` | Physical activity in past 30 days other than regular job? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 9 | `Fruits` | Consume fruit 1 or more times per day? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 10 | `Veggies` | Consume vegetables 1 or more times per day? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 11 | `HvyAlcoholConsump` | Heavy alcohol consumption (Adult men >14 drinks/week; women >7)? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 12 | `AnyHealthcare` | Do you have any kind of healthcare coverage? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 13 | `NoDocbcCost` | Was there a time in the past 12 months when you needed to see a doctor but could not because of cost? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 14 | `GenHlth` | Would you say that in general your health is: | Ordinal | `1.0` = Excellent<br>`2.0` = Very Good<br>`3.0` = Good<br>`4.0` = Fair<br>`5.0` = Poor | 0 (0.0%) |
| 15 | `MentHlth` | How many days during the past 30 days was your mental health not good? | Numeric | Days (0 – 30) | 0 (0.0%) |
| 16 | `PhysHlth` | How many days during the past 30 days was your physical health not good? | Numeric | Days (0 – 30) | 0 (0.0%) |
| 17 | `DiffWalk` | Do you have serious difficulty walking or climbing stairs? | Binary | `0.0` = No<br>`1.0` = Yes | 0 (0.0%) |
| 18 | `Sex` | Biological sex | Binary | `0.0` = Female<br>`1.0` = Male | 0 (0.0%) |
| 19 | `Age` | 13-level age category | Ordinal | `1.0` = 18–24 ... `9.0` = 60–64 ... `13.0` = 80 or older | 0 (0.0%) |
| 20 | `Education` | Highest grade or year of school completed | Ordinal | Scale `1.0` (Never attended) to `6.0` (College 4+ years) | 0 (0.0%) |
| 21 | `Income` | Annual household income from all sources | Ordinal | Scale `1.0` (< $10,000) to `8.0` ($\ge$ $75,000) | 0 (0.0%) |

---

## 3. Preprocessing Directives for ML Sprint 2

1. **Cardiovascular Imputation:**
   * `ca` (4 nulls) and `thal` (2 nulls) must be imputed using median/mode strategy strictly fit on the training split to prevent data snooping.
   * `cp`, `restecg`, `slope`, and `thal` are nominal/ordinal integers requiring One-Hot or Ordinal encoding pipelines.
2. **Diabetes Class Imbalance Handling:**
   * Target exhibits an 86.1% to 13.9% imbalance (6.18 : 1 ratio).
   * Models must incorporate class weighting (`class_weight='balanced'`) or sub-sampling inside cross-validation folds. Never evaluate solely on standard Accuracy.
