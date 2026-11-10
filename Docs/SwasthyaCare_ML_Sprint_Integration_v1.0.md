# SwasthyaCare — ML Features Integrated into the Existing Agile Sprint Planner

**Document ID:** SWC-ML-SP-002  
**Version:** 1.0  
**Status:** Proposed sprint-plan extension  
**Parent plan:** SwasthyaCare Agile Sprint Planner (SWC-SP-001, Version 1.0)  
**Planning model:** Existing 8-sprint / 16-week Agile Scrum roadmap  
**Architecture:** Existing React + Node.js/Express + MongoDB application, with Python/FastAPI ML service

---

## 1. Purpose and implementation rule

This document **adds the ML workstream to the existing SwasthyaCare sprint plan**. It does not replace the existing application roadmap and does not call for rebuilding the frontend, backend, authentication, appointment system, or database.

The existing application remains the main product. ML capabilities will be added as separate modules and integrated through the existing backend.

### Non-negotiable integration rules

1. Keep existing working features and routes unchanged unless a specific integration change is required.
2. Inspect the current repository before creating or moving files.
3. Add ML code as a separate Python/FastAPI service or as an extension of an existing AI service.
4. Extend MongoDB collections only when the ML feature needs them; do not replace the database or existing schemas wholesale.
5. The React application calls the existing Express backend. Express authenticates and authorizes the request, then calls the internal FastAPI service.
6. Keep model training and experimentation separate from production inference code.
7. Use synthetic or properly de-identified data during development.
8. Do not present an ML output as a medical diagnosis or treatment recommendation.

---

## 2. ML scope to add

The initial ML scope contains four distinct assessment tasks:

| Task ID | Disease area | Assessment type | Meaning |
|---|---|---|---|
| ML-DIA-01 | Diabetes | Current-status assessment | Estimate whether the submitted inputs are consistent with the dataset-defined diabetes status |
| ML-DIA-02 | Diabetes | Future-risk estimation | Estimate the risk of developing diabetes over a defined future period, only if suitable longitudinal data is available |
| ML-CVD-01 | Cardiovascular health | Current-status assessment | Estimate whether submitted inputs are consistent with the dataset-defined cardiovascular condition/status |
| ML-CVD-02 | Cardiovascular health | Future-risk estimation | Estimate future cardiovascular event risk over a defined period, only if suitable longitudinal data and clinical review are available |

**Important:** Current-status classification and future-risk estimation are different prediction problems. They must have separate target definitions, datasets, evaluation, API task identifiers, and model versions.

Future-risk horizons are not finalized. A five-year diabetes horizon and a ten-year cardiovascular horizon may be investigated as planning options, but neither should be treated as clinically approved until the target, dataset, population, and clinical review are confirmed.

---

## 3. ML workstream added to the existing 8 sprints

The original application sprint goals remain in place. Add the following ML tasks to the corresponding sprint; they can run alongside the existing application tasks where capacity allows.

| Existing sprint | Existing application work remains | ML work added |
|---|---|---|
| Sprint 1 | Existing foundation and developer setup | Audit current repository and define ML integration points; write prediction problem definitions |
| Sprint 2 | Existing authentication and user profiles | Define ML input data contracts, consent/authorization requirements, and safe synthetic-data pipeline |
| Sprint 3 | Existing doctor discovery and availability | Audit candidate diabetes and cardiovascular datasets; build reproducible data-loading and profiling notebooks/scripts |
| Sprint 4 | Existing appointment lifecycle | Build and evaluate first current-status baseline models; document metrics and limitations |
| Sprint 5 | Existing post-discharge follow-up | Build the second current-status baseline; assess feasibility of future-risk datasets and labels |
| Sprint 6 | Existing risk/OCR prototypes | Package approved prototype models behind FastAPI inference endpoints; add input validation, model versioning and response contracts |
| Sprint 7 | Existing dashboards and integration | Integrate ML assessments into the existing React/Express workflows; store assessment metadata and show history |
| Sprint 8 | Existing QA, security and deployment | Run ML validation, subgroup/fairness checks, calibration and failure-path tests; document model cards and release limitations |

This is an **overlay** on the existing roadmap, not a replacement. If an existing sprint has already been completed, do not repeat it; schedule the relevant ML tasks in the next available sprint after checking dependencies.

---

## 4. Detailed ML sprint tasks

### Sprint 1 — ML integration discovery and problem definition

**Goal:** Understand the existing codebase and define exactly what the ML modules must do.

| ID | Task | Priority | Expected result |
|---|---|---|---|
| ML-S1-01 | Inspect existing repository and running application | Must | Current frontend, backend, database, routes and deployment mapped |
| ML-S1-02 | Identify the correct location for the Python ML service | Must | Integration design that fits the existing repository |
| ML-S1-03 | Define diabetes current-status target | Must | Written target, intended inputs, exclusions and output meaning |
| ML-S1-04 | Define cardiovascular current-status target | Must | Written target, intended inputs, exclusions and output meaning |
| ML-S1-05 | Specify future-risk target requirements for both disease areas | Must | Required cohort, prediction horizon, event and follow-up definitions documented |
| ML-S1-06 | Create ML decision log and dataset register | Must | Dataset provenance, license, population and limitations tracked |

**Acceptance criteria**
- No existing application module is rebuilt as part of this work.
- Four ML tasks have distinct identifiers and written definitions.
- Existing authentication and authorization approach is documented for ML API access.
- Future-risk work is explicitly marked data-dependent.
- Dataset licensing and population suitability are included in the audit checklist.

**Deliverable:** ML integration map, prediction problem definitions and dataset audit checklist.

### Sprint 2 — Input contracts and safe data pipeline

**Goal:** Prepare reliable inputs and development data without changing existing patient workflows unnecessarily.

| ID | Task | Priority | Expected result |
|---|---|---|---|
| ML-S2-01 | Define diabetes current-status input schema | Must | Versioned, validated feature schema |
| ML-S2-02 | Define cardiovascular current-status input schema | Must | Versioned, validated feature schema |
| ML-S2-03 | Define shared preprocessing conventions | Must | Missing values, units, categorical encoding and ranges documented |
| ML-S2-04 | Create synthetic development/test records | Must | Repeatable non-identifiable test data |
| ML-S2-05 | Build dataset loading and validation scripts | Must | Reproducible data ingestion |
| ML-S2-06 | Define patient confirmation and provenance fields | Must | Submitted values can be traced to manual input or report extraction |
| ML-S2-07 | Define ML access-control requirements | Must | Only authorized users can request/view permitted assessments |

**Acceptance criteria**
- Input schemas reject malformed and unsupported values.
- Units and allowed ranges are documented; no silent unit conversion is assumed.
- Training and test data are separated by a reproducible split strategy.
- Synthetic data is clearly labelled and never represented as real clinical evidence.
- No unnecessary patient-identifiable data is copied into model-training datasets.

**Deliverable:** Versioned input schemas, preprocessing specification and repeatable safe data pipeline.

### Sprint 3 — Dataset audit and exploratory analysis

**Goal:** Determine whether candidate datasets actually support the intended prediction targets.

| ID | Task | Priority | Expected result |
|---|---|---|---|
| ML-S3-01 | Audit candidate diabetes datasets | Must | Dataset report with target definition, population, features and license |
| ML-S3-02 | Audit candidate cardiovascular datasets | Must | Dataset report with target definition, population, features and license |
| ML-S3-03 | Check missingness, duplicates and data quality | Must | EDA and quality report |
| ML-S3-04 | Check class balance and feature distributions | Must | Distribution and imbalance report |
| ML-S3-05 | Identify leakage and inappropriate predictors | Must | Leakage review and excluded-feature list |
| ML-S3-06 | Evaluate future-risk data suitability | Must | Evidence-based go/no-go decision for each future-risk task |
| ML-S3-07 | Create reproducible preprocessing pipeline | Should | Reusable train/evaluation transformations |

**Dataset cautions**
- UCI CDC Diabetes Health Indicators is survey-based and its diabetes-status label should not be relabelled as future diabetes onset.
- UCI Cleveland Heart Disease is a small benchmark for dataset-defined heart-disease classification; it is not a validated long-term cardiovascular risk cohort.
- Pima Indians Diabetes is a small, restricted-population benchmark and should not be represented as generally representative of Indian patients.
- Future-risk estimation requires longitudinal data: a suitable baseline cohort, timestamped predictors, confirmed incident outcomes, follow-up/censoring information, sufficient events, and permitted use.
- Dataset choice must be based on evidence, not merely availability.

**Acceptance criteria**
- Each dataset has a documented source, license/access conditions, population and label definition.
- Target labels match the intended task.
- Leakage checks are completed before model training.
- A future-risk task cannot proceed to model training unless the data supports its time horizon and outcome definition.

**Deliverable:** Dataset audit and EDA reports, plus a documented go/no-go decision for future-risk model development.

### Sprint 4 — Diabetes and cardiovascular current-status baselines

**Goal:** Train transparent baseline models for current-status tasks using approved datasets.

| ID | Task | Priority | Expected result |
|---|---|---|---|
| ML-S4-01 | Build diabetes current-status baseline | Must | Reproducible Logistic Regression baseline |
| ML-S4-02 | Compare diabetes tree-based model | Should | Random Forest or gradient-boosted comparison |
| ML-S4-03 | Build cardiovascular current-status baseline | Must | Reproducible Logistic Regression baseline |
| ML-S4-04 | Compare cardiovascular tree-based model | Should | Random Forest or gradient-boosted comparison |
| ML-S4-05 | Evaluate each model | Must | Confusion matrix, sensitivity, specificity, precision, F1, ROC-AUC and PR-AUC where appropriate |
| ML-S4-06 | Review calibration and threshold choices | Must | Calibration report and threshold rationale |
| ML-S4-07 | Save experiment metadata and artifacts | Must | Dataset version, code/config, features and model artifact traceable |

**Acceptance criteria**
- Baselines can be reproduced from documented code and configuration.
- Evaluation uses held-out data and avoids leakage.
- Accuracy is not used as the only performance measure.
- False-negative and false-positive behavior is reviewed.
- Models are labelled as research/demo prototypes, not clinically validated systems.

**Deliverable:** Two current-status baseline model pipelines and evaluation reports.

### Sprint 5 — Model evaluation and future-risk feasibility

**Goal:** Improve current-status model assessment and make a defensible decision on future-risk work.

| ID | Task | Priority | Expected result |
|---|---|---|---|
| ML-S5-01 | Compare current-status candidate models | Must | Model comparison report for diabetes and cardiovascular tasks |
| ML-S5-02 | Review subgroup performance where data permits | Must | Fairness/subgroup analysis with limitations |
| ML-S5-03 | Review calibration and decision thresholds | Must | Documented operating-point proposal for demo only |
| ML-S5-04 | Create model cards | Must | Intended use, data, metrics, limitations and version |
| ML-S5-05 | Assess diabetes future-risk dataset readiness | Must | Go/no-go decision and evidence |
| ML-S5-06 | Assess cardiovascular future-risk dataset readiness | Must | Go/no-go decision and evidence |
| ML-S5-07 | If data is suitable, define survival/fixed-horizon evaluation design | Conditional | Approved technical plan; no forced model training |
| ML-S5-08 | If data is unsuitable, record deferred status and data requirements | Must | Transparent limitation and future backlog |

**Acceptance criteria**
- Model selection is based on appropriate metrics, calibration, data fit and error analysis.
- Subgroup analysis is performed where sample sizes permit; limitations are reported.
- Future-risk tasks are not trained on cross-sectional labels.
- If longitudinal data is unavailable or unsuitable, future-risk functionality remains disabled/deferred rather than simulated as a real prediction.

**Deliverable:** Model comparison reports, model cards and documented future-risk go/no-go decisions.

### Sprint 6 — FastAPI inference integration

**Goal:** Expose approved prototype models through the Python service already planned in the parent sprint.

| ID | Task | Priority | Expected result |
|---|---|---|---|
| ML-S6-01 | Add versioned diabetes current-status inference endpoint | Must | Validated request and structured response |
| ML-S6-02 | Add versioned cardiovascular current-status inference endpoint | Must | Validated request and structured response |
| ML-S6-03 | Add model loading/version registry | Must | Explicit model identifier and version |
| ML-S6-04 | Add preprocessing parity checks | Must | Training and inference transformations match |
| ML-S6-05 | Add confidence/uncertainty and limitation fields where justified | Should | No misleading certainty display |
| ML-S6-06 | Add safe error and inconclusive responses | Must | Missing, invalid or unsupported inputs handled safely |
| ML-S6-07 | Add internal service authentication/network restriction | Must | FastAPI is not an unrestricted public endpoint |
| ML-S6-08 | Add request timeout and health checks | Must | Express handles unavailable ML service safely |
| ML-S6-09 | Add contract and integration tests | Must | API behavior verified |

**Suggested endpoint pattern**
- `POST /internal/v1/assessments/diabetes/current-status`
- `POST /internal/v1/assessments/cardiovascular/current-status`
- `GET /internal/v1/health`

Future-risk endpoints should only be added after the corresponding data and validation gate passes. Do not expose an endpoint that returns invented or placeholder risk estimates.

**Acceptance criteria**
- Express remains the public application API and performs authentication/authorization.
- FastAPI is called server-to-server.
- Request and response schemas are versioned.
- Response includes task ID, model ID/version, generated timestamp, status and limitations.
- Timeout, unavailable service and invalid input do not crash unrelated application features.
- Inference preprocessing matches the training pipeline.

**Deliverable:** Integrated, testable FastAPI inference service for the current-status prototypes.

### Sprint 7 — Existing application integration and assessment history

**Goal:** Add ML workflows to the existing user experience without replacing current screens or navigation.

| ID | Task | Priority | Expected result |
|---|---|---|---|
| ML-S7-01 | Add assessment entry point to existing patient UI | Must | New feature integrated into current navigation |
| ML-S7-02 | Add manual input workflow | Must | Patient can submit supported assessment inputs |
| ML-S7-03 | Connect existing report/OCR values where available | Should | Patient can review and confirm extracted values before assessment |
| ML-S7-04 | Add Express assessment controller/service | Must | Existing backend securely calls FastAPI |
| ML-S7-05 | Store assessment metadata in MongoDB | Must | Traceable assessment record |
| ML-S7-06 | Add patient assessment history | Must | Patient sees only their permitted records |
| ML-S7-07 | Add clinician review view if included in current role permissions | Should | Authorized clinician can review assessment details |
| ML-S7-08 | Add loading, error, incomplete and inconclusive UI states | Must | Safe user feedback |
| ML-S7-09 | Add audit events for assessment access/actions | Must | Important actions traceable |

**MongoDB integration**
- Add or extend a `riskAssessments` collection only after inspecting the existing schema.
- Store patient reference, task ID, model ID/version, assessment status, result summary, reason codes where appropriate, source/provenance, timestamps and actor references.
- Avoid storing duplicate raw medical inputs unless there is a justified, approved requirement.
- Apply access control so patients cannot view another patient's assessment.

**Acceptance criteria**
- Existing patient and clinician workflows continue to work.
- Patient input is validated by the backend.
- OCR-derived values are shown for patient confirmation before model use.
- Assessment history is access-controlled.
- UI clearly says the result is an informational prototype and not a diagnosis.
- The UI never recommends starting, stopping or changing medication.

**Deliverable:** ML assessment workflows integrated into the existing SwasthyaCare application.

### Sprint 8 — ML quality, safety and release gate

**Goal:** Verify the integrated ML feature and document its limitations before the demonstration release.

| ID | Task | Priority | Expected result |
|---|---|---|---|
| ML-S8-01 | Run model pipeline reproducibility tests | Must | Same configuration produces traceable results |
| ML-S8-02 | Run API schema and integration tests | Must | Express/FastAPI contracts pass |
| ML-S8-03 | Run input boundary and invalid-data tests | Must | Unsafe inputs rejected or marked inconclusive |
| ML-S8-04 | Run model performance and calibration review | Must | Final evaluation report |
| ML-S8-05 | Run subgroup/fairness review | Must | Findings and limitations documented |
| ML-S8-06 | Run authorization and patient-data isolation tests | Must | Cross-patient access blocked |
| ML-S8-07 | Run timeout, unavailable model and fallback tests | Must | No fabricated or stale result |
| ML-S8-08 | Review logs and sensitive-data handling | Must | No unnecessary clinical data in logs |
| ML-S8-09 | Publish model cards and known limitations | Must | Transparent demo documentation |
| ML-S8-10 | Confirm clinical and privacy review requirements | Must | No claim of clinical readiness without review |

**Acceptance criteria**
- No known critical security/privacy defect remains open.
- Model metrics and limitations are visible to the project team.
- No future-risk task is enabled without suitable longitudinal data and appropriate review.
- Service failures return a safe unavailable/inconclusive state.
- The release is clearly labelled as a project demonstration, not a clinically validated medical device or diagnostic service.

**Deliverable:** Tested ML integration, model documentation and release-readiness decision.

---

## 5. ML backlog items to add to the parent backlog

| Backlog ID | Feature | Priority | Planned sprint |
|---|---|---|---|
| ML-PB-01 | Existing codebase and ML integration audit | P0 | 1 |
| ML-PB-02 | Four prediction task definitions | P0 | 1 |
| ML-PB-03 | Versioned ML input schemas and safe data pipeline | P0 | 2 |
| ML-PB-04 | Diabetes and cardiovascular dataset audits | P0 | 3 |
| ML-PB-05 | Diabetes current-status baseline | P0 | 4 |
| ML-PB-06 | Cardiovascular current-status baseline | P0 | 4 |
| ML-PB-07 | Model comparison, calibration and subgroup review | P0 | 5 |
| ML-PB-08 | Diabetes future-risk feasibility decision | P0 | 5 |
| ML-PB-09 | Cardiovascular future-risk feasibility decision | P0 | 5 |
| ML-PB-10 | FastAPI current-status inference endpoints | P0 | 6 |
| ML-PB-11 | Express-to-FastAPI secure integration | P0 | 6 |
| ML-PB-12 | Existing UI integration and MongoDB assessment history | P0 | 7 |
| ML-PB-13 | ML regression, security and release validation | P0 | 8 |
| ML-PB-14 | Future-risk model implementation | Conditional | Only after data-readiness approval |

---

## 6. Technical integration design

```text
Existing React application
        |
        v
Existing Node.js + Express backend
  - Authentication
  - Role authorization
  - Input validation
  - Audit logging
        |
        v
Internal Python + FastAPI ML service
  - Request schemas
  - Shared preprocessing
  - Model registry/loading
  - Diabetes current-status model
  - Cardiovascular current-status model
  - Future-risk models only after approval
        |
        v
Structured response
        |
        v
Existing Express backend
        |
        +----> Existing MongoDB database
        |        - riskAssessments (add/extend only)
        |        - auditEvents (if already present, reuse)
        |
        v
Existing React application
  - Assessment result
  - Limitations
  - Assessment history
```

The browser must not call the internal FastAPI service directly. Do not expose model files, training data, database credentials or internal service credentials to the frontend.

---

## 7. Suggested model development approach

| ML task | Initial approach | Notes |
|---|---|---|
| Diabetes current-status | Logistic Regression baseline; compare Random Forest / gradient boosting | Use the exact label definition supplied by the selected dataset |
| Cardiovascular current-status | Logistic Regression baseline; compare Random Forest / gradient boosting | A small benchmark dataset must not be treated as clinical validation |
| Diabetes future-risk | Only after longitudinal data approval; consider fixed-horizon or survival methods as appropriate | Cross-sectional diabetes-status datasets do not establish future onset |
| Cardiovascular future-risk | Only after longitudinal cohort and event/follow-up approval; consider validated risk methods and survival analysis | A heart-disease presence benchmark is not a 10-year event-risk dataset |

Evaluate more than accuracy. Report sensitivity/recall, specificity, precision, F1, ROC-AUC and PR-AUC where appropriate, confusion matrix, calibration and subgroup performance where data supports it. For survival tasks, use suitable time-to-event metrics and handle censoring.

Do not select a complex model merely to make the project appear more advanced. A transparent baseline is the starting point.

---

## 8. Definition of Ready for an ML task

An ML backlog item is ready when:
- The prediction task and intended use are written clearly.
- Input features and units are defined.
- Target label and exclusions are defined.
- Dataset source, license, population and limitations are known.
- Train/validation/test strategy is documented.
- Leakage risks are considered.
- Acceptance criteria and evaluation metrics are specified.
- Integration dependencies are understood.

For future-risk tasks, the task is not ready until longitudinal outcomes, prediction horizon, follow-up/censoring and sufficient event data have been verified.

## 9. Definition of Done for an ML task

An ML task is complete when:
- Code and configuration are version-controlled.
- Data provenance and preprocessing are documented.
- Tests pass.
- Evaluation results and limitations are recorded.
- Model artifact and version are traceable.
- Inference input validation is implemented.
- API authorization and failure behavior are tested where applicable.
- UI wording avoids diagnostic claims.
- Documentation and model card are updated.

---

## 10. Clinical, privacy and safety gates

- Outputs are decision-support prototypes, not diagnoses.
- No treatment or medication instructions are generated from model scores.
- OCR text and report values must be reviewed and confirmed before use.
- Medicine-package matching must return candidates or an inconclusive result, not a definitive medication instruction.
- Do not train on identifiable patient data without appropriate authorization, governance and safeguards.
- Do not claim Indian-population representativeness without evidence.
- Do not enable future-risk estimation without suitable longitudinal data and qualified clinical review.
- Clinical deployment requires appropriate clinical validation, privacy/security review and applicable regulatory review.

---

## 11. How to use this extension with the original sprint planner

1. Keep the original 8-sprint application roadmap.
2. Add the ML task IDs in this document to the matching sprint boards.
3. Do not repeat completed application setup or rewrite existing modules.
4. Begin with ML-S1-01: inspect the current SwasthyaCare repository and identify integration points.
5. Work on ML tasks in parallel with application tasks only when dependencies and team capacity permit.
6. Carry incomplete ML tasks forward rather than marking them done without meeting acceptance criteria.
7. Update the parent sprint planner and decision log after each sprint review.

**Recommended immediate next action:** inspect the current SwasthyaCare repository, map the existing routes/components/database models, and then start ML-S1-03 to ML-S1-06 problem definition and dataset audit.
