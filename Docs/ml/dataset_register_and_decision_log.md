# SwasthyaCare — ML Dataset Register & Decision Log
## Task ML-S1-06: Data Governance, Provenance Tracking & Architecture Decisions

**Document ID:** SWC-ML-DL-001  
**Sprint:** Sprint 1 — ML Discovery & Problem Definition  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Specification Baseline  

---

## 1. Candidate Dataset Register

| Register ID | Dataset Name | Source / Provenance | Size & Features | License & Permitted Use | Target Definition | Population Characteristics | Audit Decision & Role in SwasthyaCare |
|:---:|---|---|:---:|---|---|---|---|
| **DS-01** | **UCI Cleveland Heart Disease** | Cleveland Clinic Foundation (Dr. Robert Detrano et al., 1988) via UCI ML Repo (#45) | 303 instances, 14 features | Creative Commons Attribution 4.0 International (CC BY 4.0). Permitted for research and derivative works. | Angiographic coronary stenosis ($\ge 50\%$ diameter narrowing in $\ge 1$ major vessel). | Inpatient referral cohort (Mean age: 54.4 yrs, 68% male, 32% female). High prevalence of clinical CAD. | **APPROVED for `ML-CVD-01` Current-Status Baseline.** Ideal small benchmark for pattern classification. |
| **DS-02** | **CDC Diabetes Health Indicators** | CDC Behavioral Risk Factor Surveillance System (BRFSS 2015) via Alex Teboul / UCI (#891) | 253,680 instances, 22 features | Public Domain / CC0 (U.S. Federal Government open data). Open research use. | Self-reported survey confirmation of diagnosed diabetes or prediabetes. | U.S. general adult population surveyed via telephone. 86.1% negative, 13.9% positive (6.18:1 imbalance). | **APPROVED for `ML-DIA-01` Current-Status Baseline.** Provides large-scale behavioral screening validation. |
| **DS-03** | **Pima Indians Diabetes Database** | National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) via UCI/Kaggle | 768 instances, 9 features | CC0 Public Domain. | 2-hour post-load plasma glucose or physician diagnosis. | Pima Native American female cohort ($\ge 21$ years) living near Phoenix, Arizona. Genetically distinct high-risk population. | **REJECTED for General Indian Outpatient Screening.** Severe ethnic and demographic limitation; must not be misrepresented as general Indian population data. |
| **DS-04** | **Framingham Heart Study Cohort** | National Heart, Lung, and Blood Institute (NHLBI) & Boston University | Multi-thousand participant longitudinal cohort over 20+ years | Restricted clinical research access (Requires formal IRB & BioLINCC data-use agreement). | Prospective 10-year major incident cardiovascular events (MACE). | Framingham, Massachusetts residents followed prospectively since 1948. | **EVALUATED for `ML-CVD-02` Future-Risk.** Raw participant data restricted; SwasthyaCare currently uses published Cox regression equations in Sprint 6. De novo ML training deferred. |

---

## 2. ML Architecture Decision Log (ADL)

### Decision D-ML-01: Non-Disruptive Modular Overlay Strategy
* **Context:** A full application (frontend, backend, database, appointment booking, follow-up system) was already delivered and verified in Version 1.0.0.
* **Decision:** The ML workstream will NOT rebuild or replace any existing module. It will be integrated as modular extensions to the existing Python FastAPI microservice (`ai-service/`), accessed via the existing Node.js Express Domain Gateway.
* **Rationale:** Preserves 100% of working features, eliminates regression risks, and protects the 114 passing test baseline.

### Decision D-ML-02: Strict Mathematical Separation between Current-Status and Future-Risk
* **Context:** Inexperienced machine learning developers frequently take cross-sectional datasets (like Cleveland heart disease or CDC surveys) and incorrectly label the predictions as "10-year risk of developing disease".
* **Decision:** Current-status classification (`ML-DIA-01`, `ML-CVD-01`) and prospective future-risk estimation (`ML-DIA-02`, `ML-CVD-02`) are decoupled into distinct tasks with separate identifiers, targets, model cards, and UI flows.
* **Rationale:** Adheres to epidemiological reality and FDA SaMD regulatory principles.

### Decision D-ML-03: Deferral of Future-Risk ML Training Pending Longitudinal Data Verification
* **Context:** Valid future-risk prediction requires longitudinal cohort data with verified follow-up windows, incident event documentation, and censoring tracking.
* **Decision:** Tasks `ML-DIA-02` and `ML-CVD-02` are marked **Deferred / Gated**. No machine learning models will be trained on cross-sectional data and presented as future-risk predictors. The platform's existing Framingham ASCVD calculator (from Sprint 6) will continue serving prospective risk support.
* **Rationale:** Prevents scientific fraud and maintains institutional credibility during academic review.

### Decision D-ML-04: Centralized Audit Logging via MongoDB `riskAssessments` Collection
* **Context:** Patient assessment histories must be stored for longitudinal clinical review and auditing.
* **Decision:** In Sprint 7, an additive collection `riskAssessments` will be introduced in MongoDB. It will record: `patientId`, `taskId`, `modelId`, `modelVersion`, `prediction`, `probability`, `createdAt`, and `provenance`.
* **Rationale:** Provides auditability without hydrating or duplicating raw patient clinical documents.

### Decision D-ML-05: Server-to-Server Internal RPC Security Architecture
* **Context:** Exposing the Python FastAPI microservice directly to browser clients exposes model endpoints to unauthorized requests and bypasses access control.
* **Decision:** The React frontend interacts solely with the Node.js Express Gateway over HTTPS. Express authenticates the user via JWT, validates RBAC, forwards the request internally to FastAPI, and persists assessment audit history.
* **Rationale:** Enforces least-privilege security and prevents unauthorized scraping of model weights or metadata.

### Decision D-ML-06: Binary Classification Targets
* **Context:** The Cleveland dataset features a 0–4 severity scale, and CDC BRFSS features prediabetes distinctions.
* **Decision:** For the initial baseline prototypes in Sprint 4, both targets will be binarized ($Y \in \{0, 1\}$).
* **Rationale:** Provides high numerical stability, clear clinical sensitivity/specificity metrics, and unambiguous evaluation benchmarks.

### Decision D-ML-07: Approved Safe User-Facing Clinical Wording
* **Context:** Generating an output like "You have heart disease" violates medical device regulations when produced by an unvalidated statistical prototype.
* **Decision:** Output labels are constrained to:  
  - *Positive:* `"Pattern Suggestive of [Condition] Indicator Pattern"`  
  - *Negative:* `"Pattern Currently Not Indicative of [Condition] Pattern"`  
  accompanied by mandatory SaMD disclaimers advising physician consultation.
* **Rationale:** Complies with FDA SaMD Class I/IIa software guidelines.

### Decision D-ML-08: Zero Production Identifiable Data in Training Workflows
* **Context:** Patient health information (PHI) must be protected under HIPAA.
* **Decision:** Development, exploratory analysis, and training will utilize publicly anonymized datasets and synthetic records exclusively. No live patient data will ever enter training pipelines.
* **Rationale:** Guaranteed zero HIPAA violation risk during development and demonstration.

---
*Signed off for Sprint 1 — Task ML-S1-06.*
