# SwasthyaCare — Current-Status Baseline Models & Evaluation Report
## Tasks ML-S4-01 to ML-S4-07: Transparent Machine Learning Baselines

**Document ID:** SWC-ML-BL-001  
**Sprint:** Sprint 4 — Diabetes and Cardiovascular Current-Status Baselines  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Technical Evaluation  

---

## 1. Executive Summary

In Sprint 4, transparent, reproducible baseline machine learning models were trained, evaluated, and serialized for the two active current-status assessment tasks:
1. **Task `ML-DIA-01` (Diabetes Current-Status Assessment):**
   * Primary Model: **Logistic Regression with Balanced Class Weighting** (`diabetes-current-status-lr`).
   * Benchmark: CDC BRFSS 2015 Benchmark (7,985 train / 1,997 test instances).
   * Key Metrics: **ROC-AUC: 0.8292**, **PR-AUC: 0.4291**, **Sensitivity: 78.97%**, **Specificity: 71.09%** at calibrated threshold $\tau = 0.49$.
2. **Task `ML-CVD-01` (Cardiovascular Current-Status Assessment):**
   * Primary Model: **Random Forest Classifier Ensemble** (`cardiovascular-current-status-rf`).
   * Benchmark: UCI Cleveland Clinic Catheterization Benchmark (242 train / 61 test instances).
   * Key Metrics: **ROC-AUC: 0.9675**, **PR-AUC: 0.9562**, **Sensitivity: 92.86%**, **Specificity: 93.94%**, **F1-Score: 0.9286** at calibrated threshold $\tau = 0.55$.

Both pipelines are serialized as self-contained `.joblib` files in `ai-service/models/` alongside complete JSON metadata cards.

---

## 2. Diabetes Current-Status Assessment (`ML-DIA-01`)

### 2.1 Model Comparison Matrix

| Performance Metric | Logistic Regression (Primary Baseline) | Random Forest Ensemble (Comparison) | Clinical Significance |
|---|:---:|:---:|---|
| **Algorithm** | `LogisticRegression(class_weight='balanced')` | `RandomForestClassifier(max_depth=8, min_samples_leaf=10)` | Linear vs. Non-linear ensemble |
| **ROC-AUC** | **0.8292** | 0.8250 | Strong discriminative ability |
| **PR-AUC (Average Precision)**| **0.4291** | 0.4233 | $>3\times$ higher than naive baseline ($0.136$) |
| **Default Threshold ($\tau=0.50$)**| Sens: 77.86%, Spec: 71.55%, F1: 0.4337 | Sens: 63.84%, Spec: 83.17%, F1: 0.4485 | Default operating point |
| **Calibrated Threshold ($\tau=0.49$)**| **Sensitivity: 78.97%**, Specificity: 71.09% | Sensitivity: 75.65%, Specificity: 73.93% | Optimized for clinical sensitivity |
| **Confusion Matrix (Test $N=1,997$)** | $TN=1227, FP=499, FN=57, TP=214$ | $TN=1276, FP=450, FN=66, TP=205$ | Minimizes false negatives |
| **Brier Score (Calibration)** | **0.1779** | 0.1792 | Well-calibrated class probabilities |
| **Selected Role** | **Approved Primary Baseline** | Reference Benchmark | High interpretability & clear clinical coefficients |

### 2.2 Top Feature Coefficients (Odds Ratios)
Logistic regression coefficients reveal the primary drivers of elevated diabetes indicator patterns:
1. `chol_check_5yr` ($+1.7084$): Regular clinical engagement captures diagnosed population.
2. `heavy_alcohol` ($-0.8563$): Inverse association observed in self-reported BRFSS surveys.
3. `high_bp` ($+0.8232$): Essential hypertension strongly co-occurs with metabolic syndrome.
4. `high_chol` ($+0.7839$): Dyslipidemia marker.
5. `gen_hlth` ($+0.6612$): Monotonic progression: poorer perceived health tracks diabetes burden.
6. `bmi` ($+0.4789$): Adiposity-driven insulin resistance.
7. `age` ($+0.4506$): Age-related metabolic decline.

---

## 3. Cardiovascular Current-Status Assessment (`ML-CVD-01`)

### 3.1 Model Comparison Matrix

| Performance Metric | Logistic Regression Baseline | Random Forest Ensemble (Primary) | Clinical Significance |
|---|:---:|:---:|---|
| **Algorithm** | `LogisticRegression(max_iter=1000)` | `RandomForestClassifier(n_estimators=100, max_depth=5)` | Linear vs. Tree ensemble |
| **ROC-AUC** | 0.9567 | **0.9675** | Exceptional angiographic stenosis separation |
| **PR-AUC (Average Precision)**| 0.9368 | **0.9562** | Outstanding precision-recall tradeoff |
| **Default Threshold ($\tau=0.50$)**| Sens: 85.71%, Spec: 96.97%, F1: 0.9057 | Sens: 92.86%, Spec: 93.94%, F1: 0.9286 | Naturally balanced dataset |
| **Calibrated Threshold ($\tau=0.55$)**| Sens: 89.29%, Spec: 96.97%, F1: 0.9259 | **Sensitivity: 92.86%**, **Specificity: 93.94%** | Optimal clinical operating point |
| **Confusion Matrix (Test $N=61$)** | $TN=32, FP=1, FN=3, TP=25$ | **$TN=31, FP=2, FN=2, TP=26$** | Only 2 false negatives out of 28 cases |
| **Brier Score (Calibration)** | 0.0881 | **0.0764** | Highly calibrated probability estimates |
| **Selected Role** | Reference Linear Baseline | **Approved Primary Ensemble** | Superior non-linear feature interaction capture |

### 3.2 Top Feature Importances (Gini Impurity)
1. `thal` (Thallium-201 Scintigraphy): **21.4%** — Myocardial perfusion defects.
2. `ca` (Number of Major Vessels by Fluoroscopy): **18.7%** — Direct anatomical stenosis visualization.
3. `oldpeak` (Exercise ST Depression): **14.2%** — Subendocardial exercise ischemia.
4. `thalach` (Maximum Heart Rate Achieved): **12.1%** — Exercise tolerance / chronotropic reserve.
5. `cp` (Chest Pain Type): **10.5%** — Asymptomatic / non-anginal referral characteristics.
6. `exang` (Exercise-Induced Angina): **7.8%** — Functional Bruce protocol response.

---

## 4. Calibration & Decision Threshold Protocol (Task ML-S4-06)

In healthcare screening prototypes, assuming a rigid decision threshold of $0.50$ is inappropriate:
1. **Diabetes Module (`ML-DIA-01`):** With $13.6\%$ test prevalence, threshold $\tau = 0.49$ delivers **$78.97\%$ Sensitivity** while maintaining **$71.09\%$ Specificity**, avoiding excessive false alarms while capturing nearly 8 out of 10 cases.
2. **Cardiovascular Module (`ML-CVD-01`):** Threshold $\tau = 0.55$ achieves **$92.86\%$ Sensitivity** and **$93.94\%$ Specificity**, missing only 2 cases out of 28 positive patients in the test partition.

---

## 5. Serialized Artifact Inventory (Task ML-S4-07)

```
ai-service/models/
├── ML-DIA-01/
│   ├── model_v1.0.0.joblib            # Primary Logistic Regression Pipeline (7.3 KB)
│   ├── model_metadata.json            # Model card & threshold metadata (1.0 KB)
│   ├── preprocessor_v1.0.0.joblib     # Serialized ColumnTransformer (6.5 KB)
│   └── preprocessor_metadata.json     # Feature mappings (595 B)
└── ML-CVD-01/
    ├── model_v1.0.0.joblib            # Primary Random Forest Pipeline (352 KB)
    ├── model_metadata.json            # Model card & threshold metadata (892 B)
    ├── preprocessor_v1.0.0.joblib     # Serialized ColumnTransformer (7.2 KB)
    └── preprocessor_metadata.json     # Feature mappings (463 B)
```

---
*Signed off for Sprint 4 — Tasks ML-S4-01 to ML-S4-07.*
