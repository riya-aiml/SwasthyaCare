# 8. Sprint 9–12 Implementation Plan

**Cadence:** four 2-week sprints (8 weeks). Existing Sprints 1–8 remain unchanged. Estimates must be adjusted to team capacity and repository findings.

## Sprint 9 — Discovery, product foundation and safety design (Weeks 17–18)
**Goal:** Fit the assistant into the existing application and freeze the first delivery scope.

Tasks:
- S9-01 Inspect current React, Express, MongoDB, FastAPI structure, deployment and conventions.
- S9-02 Map authentication, roles, patient ownership, appointments, queue, OCR, assessments and reminders.
- S9-03 Decide orchestration location; avoid duplicate service/database/business logic.
- S9-04 Finalize feature catalogue, user journeys, MVP vs later scope and acceptance criteria.
- S9-05 Define intent taxonomy and separate healthcare/app knowledge scopes.
- S9-06 Define chat session/message/feedback/action-confirmation data contracts.
- S9-07 Define public Express API and internal AI-service contract.
- S9-08 Register approved knowledge sources and app documentation owners.
- S9-09 Draft symptom, emergency, report, assessment and medicine guardrails.
- S9-10 Define tool allow-list, action confirmation and human handoff flows.
- S9-11 Define retention/deletion, privacy and operational logging policy.
- S9-12 Create synthetic evaluation set, threat scenarios and UX wireframes.

Acceptance criteria:
- Architecture map and integration inventory approved.
- Feature scope and exclusions documented.
- Existing auth and services reused.
- Data/API contracts reviewed.
- Source governance and clinical review owners identified.
- Safety policy, privacy decisions and release gates documented.

Deliverables: PRD, architecture decision record, data/API contracts, source register, safety policy, backlog and test plan.

## Sprint 10 — LLM integration, RAG and core Q&A (Weeks 19–20)
**Goal:** Deliver grounded healthcare Q&A and app-help responses behind the backend.

Tasks:
- S10-01 Implement provider adapter and secure server-side configuration.
- S10-02 Add timeout, token budget, rate limit, cost guard and provider error handling.
- S10-03 Build healthcare and app knowledge ingestion separately.
- S10-04 Add chunking, provenance metadata, embeddings and versioning.
- S10-05 Configure retrieval, metadata filters and relevance thresholds.
- S10-06 Implement intent routing and RAG prompt assembly.
- S10-07 Implement citation validation and structured response schema.
- S10-08 Add no-evidence, conflicting-source and provider-unavailable behavior.
- S10-09 Add safety pre-check/output validation and prompt-injection tests.
- S10-10 Evaluate English answers; begin Hindi only if source and review coverage exists.

Acceptance criteria:
- Supported healthcare and app questions answer from correct knowledge scope.
- Citations map to retrieved, approved sources.
- Unsupported questions receive transparent limitation responses.
- Retrieved text cannot override system policy.
- Provider keys never appear in frontend or repository.
- Automated evaluation baseline is recorded.

Deliverables: internal AI endpoint, provider adapter, two knowledge indexes, ingestion process and evaluation report.

## Sprint 11 — Patient-facing integration and app workflows (Weeks 21–22)
**Goal:** Integrate the assistant into SwasthyaCare and enable authorized assistance.

Tasks:
- S11-01 Implement authenticated Express chat routes using existing middleware.
- S11-02 Add session ownership, role checks, rate limits and message persistence.
- S11-03 Build React chat UI, history, quick actions, citations and feedback.
- S11-04 Add page-aware help and allow-listed navigation actions.
- S11-05 Add authorized patient-context adapter for confirmed reports and assessments.
- S11-06 Add report explanation using only patient-confirmed OCR fields.
- S11-07 Add assessment explanation with model/version and limitations.
- S11-08 Add appointment assistance through existing APIs; require explicit confirmation for mutations.
- S11-09 Add queue and follow-up help only if existing APIs/data and permissions support it.
- S11-10 Add human handoff and delete-session flow.
- S11-11 Add English/Hindi only after quality and safety review.
- S11-12 Evaluate voice and medicine-image support; implement only if capacity and approvals permit.

Acceptance criteria:
- Patient A cannot access Patient B's sessions or context.
- Browser cannot supply trusted identity or bypass permissions.
- Report explanation rejects unconfirmed/ambiguous OCR values.
- Appointment actions are confirmed and revalidated.
- Navigation uses allow-listed routes.
- Queue/follow-up answers use real authorized data.
- Existing app regression tests pass.

Deliverables: integrated assistant, chat history, authorized app tools, report/assessment help and workflow QA report.

## Sprint 12 — Advanced capability validation, safety QA and controlled release (Weeks 23–24)
**Goal:** Validate reliability, safety and readiness for a controlled demonstration.

Tasks:
- S12-01 Expand evaluation for groundedness, citations, intent routing and multilingual quality.
- S12-02 Run clinical review of symptom guidance, emergency language, report/assessment templates and medicine content if enabled.
- S12-03 Test prompt injection, data exfiltration attempts and unsafe advice.
- S12-04 Test cross-patient, cross-role and unauthorized tool access.
- S12-05 Test deletion/retention across messages, feedback, caches and derived indexes.
- S12-06 Test provider/retrieval outage, rate limits, timeouts and duplicate requests.
- S12-07 Test appointment confirmation, expiry, revalidation and idempotency.
- S12-08 Test accessibility, responsive layout, voice fallback and supported locales.
- S12-09 Test human handoff, feedback, summaries and queue/follow-up data where implemented.
- S12-10 Review cost, latency, logging, monitoring and incident response.
- S12-11 Complete security/privacy review and clinical sign-off.
- S12-12 Run full regression, release checklist and rollback rehearsal.

Acceptance criteria:
- No unresolved critical security or unsafe-advice issues.
- Clinical sign-off exists for every enabled clinical workflow.
- Critical authorization and deletion tests pass.
- Operational logs do not expose raw sensitive chat content by default.
- Known limitations, supported languages and rollback plan are documented.
- Release limited to approved demo/test cohort until broader validation.

Deliverables: QA report, safety review record, security/privacy report, release notes, rollback plan and controlled demo.

## Definition of Ready
Story has owner, dependencies, acceptance criteria, data permissions, safety impact and test approach.

## Definition of Done
Code reviewed; automated tests passed; privacy/security reviewed; docs updated; UI accessible; failure paths tested; clinical/product sign-off obtained where required.

## Sprint ceremonies
Planning, short daily stand-up, mid-sprint demo, sprint review with product/clinical stakeholders and retrospective.
