# SwasthyaCare — Shared Machine Learning Preprocessing Specification
## Task ML-S2-03: Modular Pipeline Architecture & Data Transformation Standards

**Document ID:** SWC-ML-PP-001  
**Sprint:** Sprint 2 — Input Contracts, Safe Data Pipeline & Preprocessing  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Technical Specification  

---

## 1. Overview & Architectural Principles

Machine learning clinical decision-support models require deterministic, reproducible, and leakage-free data transformations. In SwasthyaCare, all feature transformations are packaged into self-contained `scikit-learn` `Pipeline` and `ColumnTransformer` objects serialized via `joblib`. 

### Core Engineering Invariants
1. **Zero Data Leakage:** Preprocessors (imputers, scalers, encoders) are fit **exclusively** on the training partition ($D_{\text{train}}$). No parameters (means, medians, scales, category lists) are ever calculated across the entire dataset or leaked from validation/test partitions.
2. **Deterministic Inference:** At runtime, the inference server passes the raw Pydantic-validated dictionary directly into the loaded `pipeline.predict_proba()`. No manual ad-hoc arithmetic is performed inside API route handlers.
3. **Imbalance Isolation:** Synthetic resampling (SMOTE, ADASYN, RandomOverSampler) is strictly applied **only** to the training split ($D_{\text{train}}$). Resampling validation or test sets is clinically invalid and strictly prohibited.
4. **Probability Calibration:** Raw classifier logits or tree ensemble decision functions are post-calibrated (Platt scaling / Sigmoid or Isotonic regression) on a distinct calibration split before publishing probability scores.

---

## 2. Pipeline Architecture & Execution Flow

```
[ Raw Patient Payload / Synthetic Ingestion ]
                    │
                    ▼
[ Stage 1: Pydantic Contract Validation ]
• Validates types, non-null constraints, and physiological bounds
• Rejects out-of-distribution values (HTTP 422 Unprocessable Entity)
                    │
                    ▼
[ Stage 2: Feature Split & Partitioning ]
• Train/Test Split (Stratified 80/20) fit before any statistical computation
                    │
                    ▼
[ Stage 3: ColumnTransformer (Fit on Train Only) ]
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│     Numeric Pipeline      │    Categorical Pipeline   │     Binary Pass-Through   │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ • SimpleImputer(median)   │ • SimpleImputer(mode)     │ • SimpleImputer(mode)     │
│ • StandardScaler()        │ • OneHotEncoder(ignore)   │ • Identity / Boolean map  │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
                    │
                    ▼
[ Stage 4: Training-Only Balancing (Optional) ]
• SMOTE / RandomOverSampler (Applied ONLY to Train Split if Imbalance > 4:1)
                    │
                    ▼
[ Stage 5: Estimator Fitting & Calibration ]
• Cross-Validated Hyperparameter Search (GridSearchCV / RandomizedSearchCV)
• CalibratedClassifierCV(method='sigmoid', cv='prefit')
                    │
                    ▼
[ Stage 6: Artifact Serialization ]
• joblib.dump(full_pipeline, "models/<task_id>/<model_id>_v1.0.0.joblib")
```

---

## 3. Detailed Preprocessing per Task

### 3.1 Task ML-DIA-01: Diabetes Current-Status Assessment
* **Benchmark:** CDC BRFSS (253,680 instances, 21 predictors)
* **Class Balance:** Negative (0) = 86.1%, Positive (1) = 13.9% (6.18:1 ratio)

#### Feature Transformation Table:
| Feature Name | Type | Range / Categories | Imputation Strategy | Encoding / Scaling | Rationale |
|---|---|---|---|---|---|
| `BMI` | Continuous Numeric | 12.0 – 70.0 $\text{kg/m}^2$ | Median ($D_{\text{train}}$) | `StandardScaler()` | Normalized zero-mean, unit-variance for regularized models |
| `PhysHlth` | Discrete Numeric | 0 – 30 days | Median ($D_{\text{train}}$) | `StandardScaler()` | Captures physical morbidity burden |
| `MentHlth` | Discrete Numeric | 0 – 30 days | Median ($D_{\text{train}}$) | `StandardScaler()` | Captures mental morbidity burden |
| `GenHlth` | Ordinal | 1 – 5 | Mode ($D_{\text{train}}$) | Preserved integer scale / Scaled | Natural monotonic progression (1=Excellent to 5=Poor) |
| `Age` | Ordinal | 1 – 13 age bands | Mode ($D_{\text{train}}$) | Preserved integer scale / Scaled | Monotonic increase in diabetes prevalence |
| `Education` | Ordinal | 1 – 6 | Mode ($D_{\text{train}}$) | Preserved integer scale | Socioeconomic control predictor |
| `Income` | Ordinal | 1 – 8 | Mode ($D_{\text{train}}$) | Preserved integer scale | Socioeconomic control predictor |
| `HighBP`, `HighChol`, `CholCheck`, `Smoker`, `Stroke`, `HeartDiseaseorAttack`, `PhysActivity`, `Fruits`, `Veggies`, `HvyAlcoholConsump`, `AnyHealthcare`, `NoDocbcCost`, `DiffWalk`, `Sex` | Binary Flags | 0 or 1 | Mode ($D_{\text{train}}$) | Identity integer passthrough | Binary indicators directly compatible with linear and tree models |

---

### 3.2 Task ML-CVD-01: Cardiovascular Current-Status Assessment
* **Benchmark:** UCI Cleveland Heart Disease (303 instances, 13 predictors)
* **Class Balance:** Negative (0) = 54.5%, Positive (1) = 45.5% (Balanced)

#### Feature Transformation Table:
| Feature Name | Clinical Description | Range / Categories | Imputation Strategy | Transformation |
|---|---|---|---|---|
| `age` | Chronological Age | 18 – 100 years | Median ($D_{\text{train}}$) | `StandardScaler()` |
| `trestbps` | Resting Blood Pressure | 60 – 260 mmHg | Median ($D_{\text{train}}$) | `StandardScaler()` |
| `chol` | Serum Cholesterol | 80 – 650 mg/dL | Median ($D_{\text{train}}$) | `StandardScaler()` |
| `thalach` | Maximum Heart Rate | 50 – 250 bpm | Median ($D_{\text{train}}$) | `StandardScaler()` |
| `oldpeak` | ST Depression relative to rest | 0.0 – 10.0 mm | Median ($D_{\text{train}}$) | `StandardScaler()` |
| `sex` | Biological Sex | 0=Female, 1=Male | Mode ($D_{\text{train}}$) | Binary Passthrough |
| `fbs` | Fasting Blood Sugar > 120 | 0=False, 1=True | Mode ($D_{\text{train}}$) | Binary Passthrough |
| `exang` | Exercise Induced Angina | 0=No, 1=Yes | Mode ($D_{\text{train}}$) | Binary Passthrough |
| `cp` | Chest Pain Type | 1, 2, 3, 4 | Mode ($D_{\text{train}}$) | `OneHotEncoder(drop='first', handle_unknown='ignore')` |
| `restecg` | Resting ECG Results | 0, 1, 2 | Mode ($D_{\text{train}}$) | `OneHotEncoder(drop='first', handle_unknown='ignore')` |
| `slope` | Peak Exercise ST Slope | 1, 2, 3 | Mode ($D_{\text{train}}$) | `OneHotEncoder(drop='first', handle_unknown='ignore')` |
| `ca` | Major fluoroscopy vessels | 0, 1, 2, 3 (missing '?') | Median ($D_{\text{train}}$) | Impute missing median, integer scale |
| `thal` | Thallium Scintigraphy | 3=Norm, 6=Fixed, 7=Rev | Mode ($D_{\text{train}}$) | Impute missing mode, `OneHotEncoder(handle_unknown='ignore')` |

---

## 4. Imbalance Management Protocol

1. **Threshold for Resampling:** When minority class prevalence is $< 20\%$ (e.g., CDC BRFSS at 13.9%), class weighting (`class_weight='balanced'`) is the primary remediation strategy.
2. **Synthetic Resampling (`imblearn` SMOTE):**
   * If SMOTE is utilized, it must be embedded within an `imblearn.pipeline.Pipeline` so that the `.fit_resample()` method only ever executes during the training phase.
   * Resampling MUST NOT be applied to test, validation, or live inference pipelines.
3. **Threshold Calibration:** Instead of assuming a generic 0.5 decision threshold, optimal classification thresholds will be calibrated in Sprint 5 using precision-recall curves to optimize clinical sensitivity while constraining false alarm rates.

---

## 5. Artifact Directory & Serialization Structure

All generated transformation artifacts must adhere to this directory hierarchy:

```
ai-service/
├── app/
│   └── schemas/
│       ├── diabetes_assessment.py
│       └── cardiovascular_assessment.py
├── data/
│   ├── raw/                 # Downloaded public benchmarks (.gitignore)
│   ├── synthetic/           # Synthesized privacy-preserving dev records
│   └── processed/           # Cached train/val/test splits (.gitignore)
├── models/
│   ├── ML-DIA-01/
│   │   ├── preprocessor_v1.0.0.joblib
│   │   ├── model_v1.0.0.joblib
│   │   └── metadata.json
│   └── ML-CVD-01/
│       ├── preprocessor_v1.0.0.joblib
│       ├── model_v1.0.0.joblib
│       └── metadata.json
└── training/
    ├── data_loader.py       # Deterministic loading & schema validation
    ├── preprocess.py        # Shared ColumnTransformer builders
    └── synthetic_generator.py # Synthetic clinical record synthesis
```

---
*Signed off for Sprint 2 — Task ML-S2-03.*
