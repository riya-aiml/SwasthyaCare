# SwasthyaCare — Future-Risk Feasibility Sign-Off & Future Backlog Roadmap
## Tasks ML-S5-05, ML-S5-06, ML-S5-07 & ML-S5-08: Formal Governance Sign-Off

**Document ID:** SWC-ML-FR-SO-001  
**Sprint:** Sprint 5 — Model Evaluation, Fairness & Model Cards  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Executive & Clinical Sign-Off  

---

## 1. Executive Summary & Governance Verdict

In conformance with Section 2, Section 4, and Sprint 5 of `SwasthyaCare_ML_Sprint_Integration_v1.0.md`, the AI Workstream Governance Committee has formally audited candidate datasets and clinical literature for prospective multi-year future risk estimation.

### Formal Gating Verdict:
1. **Task `ML-DIA-02` (Diabetes 5-Year Future-Risk Estimation):**  
   **VERDICT: ❌ GATED / DEFERRED TO FUTURE BACKLOG.**  
   *Evidence:* Available public benchmarks (CDC BRFSS, Pima Indians) are cross-sectional snapshots with zero longitudinal tracking. Training a future-risk estimator on cross-sectional data constitutes scientific misrepresentation.
2. **Task `ML-CVD-02` (Cardiovascular 10-Year Prospective MACE Estimation):**  
   **VERDICT: ❌ DE NOVO ML TRAINING GATED; SPRINT 6 COX ENGINE RETAINED.**  
   *Evidence:* The platform already features an active, peer-reviewed **Framingham 10-Year ASCVD Risk Calculator** implementing NHLBI Cox proportional hazards coefficients in `ai-service/app/services/heart_risk.py`. Raw participant-level longitudinal datasets remain restricted by BioLINCC data-use agreements. De novo ML training is deferred until raw cohort records are authorized.

---

## 2. Gating Audit Sign-Off Matrix

| Gating Criteria | Task ML-DIA-02 (5-Yr Diabetes Risk) | Task ML-CVD-02 (10-Yr CVD Risk) |
|---|:---:|:---:|
| **1. Confirmed Disease-Free Baseline Cohort** | ❌ FAILED (prevalent cases present) | ❌ FAILED in Cleveland catheterization data |
| **2. Fixed Prospective Time Horizon ($\Delta t$)** | ❌ FAILED (cross-sectional snapshot) | ❌ FAILED in Cleveland catheterization data |
| **3. Adjudicated Incident Disease Events** | ❌ FAILED (zero follow-up events) | ❌ FAILED in Cleveland catheterization data |
| **4. Survival Censoring Tracking ($T_i, \delta_i$)** | ❌ FAILED (no loss-to-follow-up data) | ❌ FAILED in Cleveland catheterization data |
| **5. Statistical Power for Survival Analysis** | ❌ FAILED | ❌ FAILED |
| **6. Institutional Review & Ethics Agreement** | ❌ FAILED (requires prospective IRB) | ❌ FAILED (requires BioLINCC DUA) |
| **FINAL FEASIBILITY VERDICT** | **DEFERRED (ML-PB-14)** | **DEFERRED (ML-PB-14); RETAIN COX ENGINE** |

---

## 3. UI State & User Transparency Requirements

To maintain transparency during demonstrations and academic review:
1. **Future-Risk Navigation Guard:** The SwasthyaCare frontend application will clearly present:
   * **`ML-DIA-01`**: Active Current-Status Assessment Card (`/assessments/diabetes`).
   * **`ML-CVD-01`**: Active Current-Status Assessment Card (`/assessments/cardiovascular`).
   * **`ML-CVD-02`**: Prospective 10-year risk handled by the existing Framingham Clinical Calculator (`/predict/heart-risk`).
   * **`ML-DIA-02`**: Informational banner:  
     `"Prospective 5-Year Diabetes Incident Risk Estimation is undergoing clinical cohort validation and is scheduled for a future release (Backlog Item ML-PB-14)."`
2. **SaMD Prohibition:** Neither the frontend nor backend will ever extrapolate cross-sectional outputs into prospective "X-year risk" metrics.

---

## 4. Future Backlog Roadmap: Item ML-PB-14

To transition `ML-DIA-02` and `ML-CVD-02` from **Deferred** to **Active** in future post-v1.0 releases, the engineering team must satisfy the following technical prerequisites:

```
[ Phase 1: Longitudinal Cohort Acquisition ]
• Execute Data Use Agreement with BioLINCC / UK Biobank / ICMR Indian Registry
• Acquire multi-thousand participant cohort with confirmed follow-up >= 5-10 years
                    │
                    ▼
[ Phase 2: Survival Model Architecture ]
• Implement Cox Proportional Hazards or DeepSurv / Random Survival Forests
• Train on baseline predictors (t0); optimize concordance index (C-index)
                    │
                    ▼
[ Phase 3: Time-to-Event Calibration ]
• Evaluate dynamic Brier score and time-dependent ROC curves
• Calibrate survival curves against Kaplan-Meier empirical survival
                    │
                    ▼
[ Phase 4: Clinical & Ethics Board Review ]
• IRB approval for algorithmic prospective risk scoring
• Transition task to production release
```

---
*Signed off by AI Workstream Governance — Tasks ML-S5-05, ML-S5-06, ML-S5-07 & ML-S5-08.*
