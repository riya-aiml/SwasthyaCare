# SwasthyaCare — Data Leakage Review & Excluded Features Specification
## Task ML-S3-05: Temporal Integrity & Inappropriate Predictor Analysis

**Document ID:** SWC-ML-LR-001  
**Sprint:** Sprint 3 — Dataset Audit & Exploratory Data Analysis  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Technical & Clinical Specification  

---

## 1. Regulatory & Methodological Principles

Data leakage is the introduction of information about the target variable that would not naturally be available at the time of clinical decision-making. In medical software as a medical device (SaMD), data leakage produces artificially inflated accuracy during testing that collapses disastrously in clinical deployment.

SwasthyaCare enforces four mandatory leakage-prevention rules:
1. **Temporal Precedence:** Features must represent historical traits, baseline demographics, or current presenting symptoms collected *prior to* or *at the time of* assessment.
2. **No Post-Intervention Contamination:** Predictors must not include post-treatment outcomes, surgical procedures, or recovery statuses.
3. **No Direct Target Proxies:** Features that directly encode disease treatment (e.g., active insulin prescription) must not be used to predict disease presence unless explicitly defined as part of a diagnostic criteria rule engine.
4. **Partition Isolation:** Preprocessing transformers (imputers, scalers, encoders) must be computed exclusively on the training split ($D_{\text{train}}$).

---

## 2. Leakage Review by Task

### 2.1 Task ML-DIA-01: Diabetes Current-Status Assessment

#### Feature Leakage Evaluation:
| Candidate Feature | Category | Included / Excluded | Technical & Clinical Rationale |
|---|---|:---:|---|
| `Diabetes_binary` | Target Label | **Target Only** | Never included in input feature matrix $\mathbf{X}$. |
| `HighBP`, `HighChol`, `CholCheck` | Historical Diagnoses | **Included** | Established metabolic co-morbidities collected during routine screening. |
| `BMI`, `Age`, `Sex` | Biometrics / Demographics | **Included** | Baseline anthropometric parameters measurable at triage. |
| `Smoker`, `PhysActivity`, `Fruits`, `Veggies`, `HvyAlcohol` | Lifestyle Behaviors | **Included** | Self-reported behavioral habits reflecting chronic lifestyle patterns. |
| `GenHlth`, `PhysHlth`, `MentHlth`, `DiffWalk` | Subjective & Functional Health | **Included** | Captures subjective symptom burden and functional impairment. |
| `AnyHealthcare`, `NoDocbcCost`, `Education`, `Income` | Socioeconomic Factors | **Included** | Control variables for healthcare access and social determinants of health. |
| *Active Insulin Titration Schedule* | Therapeutic Intervention | ❌ **EXCLUDED** | Direct treatment proxy; indicates already-confirmed diagnosis. |
| *Metformin Daily Dosage* | Therapeutic Intervention | ❌ **EXCLUDED** | Direct treatment proxy; indicates already-confirmed diagnosis. |
| *Diabetic Retinopathy Laser Photocoagulation* | Complication Surgery | ❌ **EXCLUDED** | Post-diagnosis surgical intervention. |

---

### 2.2 Task ML-CVD-01: Cardiovascular Current-Status Assessment

#### Feature Leakage Evaluation:
| Candidate Feature | Category | Included / Excluded | Technical & Clinical Rationale |
|---|---|:---:|---|
| `num` (Severity 0–4) | Target Label | **Target Only** | Binarized to $\{0, 1\}$; excluded from input matrix $\mathbf{X}$. |
| `age`, `sex` | Demographics | **Included** | Fundamental baseline non-modifiable risk factors. |
| `cp` (Chest Pain Type 1–4) | Presenting Symptom | **Included** | Primary symptom prompting diagnostic evaluation. |
| `trestbps`, `chol`, `fbs` | Hemodynamics & Lipids | **Included** | Routine baseline lab/vitals recorded upon admission. |
| `restecg` | Baseline ECG | **Included** | Non-invasive resting 12-lead ECG prior to stress protocol. |
| `thalach`, `exang`, `oldpeak`, `slope` | Stress Test Vitals | **Included** | Standard diagnostic Bruce protocol treadmill exercise parameters. |
| `ca`, `thal` | Diagnostic Imaging | **Included** | Non-invasive fluoroscopy and nuclear scintigraphy tests. |
| *Percutaneous Coronary Intervention (PCI / Stenting)* | Surgical Intervention | ❌ **EXCLUDED** | Post-angiogram therapeutic procedure; represents leakage of angiographic findings. |
| *Coronary Artery Bypass Graft (CABG)* | Surgical Intervention | ❌ **EXCLUDED** | Post-diagnostic revascularization surgery. |
| *Post-Operative Cardiac ICU Length of Stay* | Inpatient Outcome | ❌ **EXCLUDED** | Temporal violation; occurs days after diagnostic evaluation. |
| *Sublingual Nitroglycerin Dosage Titration* | Medication Management | ❌ **EXCLUDED** | Pharmacological treatment titration. |

---

## 3. Pipeline Leakage Prevention Implementation

To guarantee code-level partition isolation, SwasthyaCare enforces pipeline construction using `scikit-learn` `Pipeline`:

```python
# CORRECT: Pipeline encapsulates preprocessor and estimator together
full_pipeline = Pipeline([
    ('preprocessor', build_diabetes_preprocessor()),
    ('classifier', LogisticRegression(class_weight='balanced', random_state=42))
])

# Fit executes imputer.fit() and scaler.fit() strictly on X_train
full_pipeline.fit(X_train, y_train)

# Evaluation on held-out test data strictly transforms without re-fitting
y_pred = full_pipeline.predict(X_test)
```

**Prohibited Anti-Patterns in SwasthyaCare:**
* ❌ `preprocessor.fit_transform(X)` before `train_test_split()`.
* ❌ Calculating global mean/median imputation across the full dataset.
* ❌ Using SMOTE or random oversampling on the test split.

---
*Signed off for Sprint 3 — Task ML-S3-05.*
