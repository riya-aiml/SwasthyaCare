# SwasthyaCare — Future-Risk Feasibility Evaluation & Gating Decision
## Task ML-S3-06: Formal Evidence-Based Go / No-Go Decision on Prospective Risk Modeling

**Document ID:** SWC-ML-FR-001  
**Sprint:** Sprint 3 — Dataset Audit & Exploratory Data Analysis  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Architectural Decision  

---

## 1. Context & Methodological Foundation

A critical contribution of the SwasthyaCare ML Integration Roadmap is the strict mathematical and epidemiological separation between:
1. **Current-Status Classification** ($P(Y=1 \mid \mathbf{x}_{t_0})$): Determining whether a patient's existing clinical or survey vector matches disease characteristics *right now*.
2. **Prospective Future-Risk Estimation** ($P(T \le t_0 + \Delta t \mid \mathbf{x}_{t_0}, Y_{t_0}=0)$): Predicting the probability that an individual *currently free of disease* will develop incident disease over a future time horizon $\Delta t$ (e.g., 5 or 10 years).

In academic and commercial AI engineering, taking a cross-sectional dataset (such as the CDC BRFSS survey or the Cleveland angiogram records) and claiming that its output represents a "10-year risk of developing heart disease" is a severe scientific error.

---

## 2. Six Mandatory Gating Conditions for Prospective Risk Modeling

Under Section 2 and Section 4 of `SwasthyaCare_ML_Sprint_Integration_v1.0.md`, no prospective risk model may proceed to training or deployment unless all six gating conditions are satisfied:

| Gate Condition | Clinical Requirement | Audit Verification Criteria |
|---|---|---|
| **Gate 1: Disease-Free Baseline** | All participants must be confirmed free of the target disease at baseline $t_0$. | Cohort must exclude prevalent cases at entry. |
| **Gate 2: Explicit Time Horizon** | Fixed observation window (e.g., $\Delta t = 5$ or 10 years) or continuous survival tracking. | Timestamps of baseline examination and follow-up closure. |
| **Gate 3: Adjudicated Incident Events** | Objective clinical confirmation of disease conversion during the follow-up window. | Laboratory criteria ($\text{HbA}_{1c} \ge 6.5\%$) or adjudicated hospital discharge records. |
| **Gate 4: Censoring Accounting** | Rigorous tracking of loss to follow-up, study termination, and competing mortalities. | Status flag $\delta_i \in \{0, 1\}$ and survival duration $T_i$. |
| **Gate 5: Statistical Power** | Minimum number of verified incident events to prevent model overfitting. | Minimum 10 events per candidate feature degrees of freedom. |
| **Gate 6: Licensing & Ethics** | Explicit IRB and Data Use Agreement permitting algorithmic risk scoring. | Valid institutional agreement (e.g., BioLINCC DUA). |

---

## 3. Task-by-Task Feasibility Audit & Decision

### 3.1 Task ML-DIA-02: Diabetes 5-Year Future-Risk Estimation

* **Candidate Datasets Evaluated:**
  * CDC BRFSS 2015 (253,680 instances)
  * Pima Indians Cross-Sectional Slice (768 instances)
* **Gating Audit Results:**
  * ❌ *Gate 1 (Disease-Free Baseline):* FAIL. CDC BRFSS includes individuals who have had diabetes for decades.
  * ❌ *Gate 2 (Explicit Horizon):* FAIL. Single-point-in-time telephone survey; zero future follow-up.
  * ❌ *Gate 3 (Incident Events):* FAIL. No transition events tracked.
  * ❌ *Gate 4 (Censoring):* FAIL. Zero longitudinal survival metrics.
* **DECISION: ❌ GATED / DEFERRED.**
  * No de novo ML model will be trained on cross-sectional data and presented as a future risk calculator.
  * **User-Facing UI State:**  
    `"Future 5-Year Diabetes Risk Model is currently undergoing longitudinal validation and is not available in this release."`

---

### 3.2 Task ML-CVD-02: Cardiovascular 10-Year Prospective Risk Estimation

* **Candidate Datasets Evaluated:**
  * UCI Cleveland Clinic Heart Disease (303 instances)
  * Framingham Heart Study Cohort (Multi-thousand participants)
* **Gating Audit Results for Cleveland Clinic:**
  * ❌ *Gate 1 (Disease-Free Baseline):* FAIL. Inpatient referral cohort undergoing catheterization for suspected severe CAD.
  * ❌ *Gate 2 (Explicit Horizon):* FAIL. Cross-sectional diagnostic snapshot.
  * ❌ *Gate 3 (Incident Events):* FAIL. Measures existing stenosis percentage, not 10-year stroke incidence.
* **Gating Audit Results for Framingham Heart Study Cohort:**
  * ✅ *Gates 1–5:* SATISFIED. True prospective longitudinal cohort followed over multiple decades with verified MACE outcomes.
  * ❌ *Gate 6 (Raw Data Access):* RESTRICTED. Direct access to raw participant-level rows requires formal institutional IRB and BioLINCC data-use agreement.
* **DECISION: ❌ DE NOVO ML TRAINING GATED; SPRINT 6 COX ENGINE RETAINED.**
  * SwasthyaCare **already possesses** an institutional, peer-reviewed **Framingham 10-Year ASCVD Risk Calculator** built into the AI microservice (`/api/ai/predict/heart-risk`), implementing published NHLBI Cox proportional hazards coefficients.
  * Training a separate de novo machine learning model for `ML-CVD-02` is deferred until raw participant-level cohort records are approved.
  * The existing Framingham calculator continues to serve 10-year prospective risk support, while the new ML pipeline focuses strictly on cross-sectional diagnostic pattern classification (`ML-CVD-01`).

---

## 4. Summary Matrix of Gating Decisions

| Task Identifier | Disease Domain | Proposed Model | Audit Verdict | Production Action |
|:---:|---|---|:---:|---|
| **`ML-DIA-01`** | Diabetes | Current-Status Classification | ✅ **APPROVED** | Train baseline models in Sprint 4 |
| **`ML-DIA-02`** | Diabetes | 5-Year Future Risk Estimation | ❌ **GATED** | Deferred; display informational roadmap notice |
| **`ML-CVD-01`** | Cardiovascular | Current-Status Classification | ✅ **APPROVED** | Train baseline models in Sprint 4 |
| **`ML-CVD-02`** | Cardiovascular | 10-Year Prospective MACE | ❌ **GATED** | De novo ML deferred; existing Sprint 6 Cox engine serves 10-year risk |

---
*Signed off for Sprint 3 — Task ML-S3-06.*
