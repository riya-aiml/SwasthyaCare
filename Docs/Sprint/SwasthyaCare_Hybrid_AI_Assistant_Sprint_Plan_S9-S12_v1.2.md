# 02 — Sprint Plan 9 to 12

The chatbot work is an eight-week extension using four two-week sprints. The original SwasthyaCare Sprints 1–8 remain intact.

## Sprint 9 — Discovery and product foundation (Weeks 17–18)
**Goal:** understand the real codebase and finalize safe implementation contracts.

Tasks:
- S9-01 inspect repository, current routes, auth, database models, AI service and existing workflows
- S9-02 map user roles and patient-context authorization
- S9-03 finalize product requirements, intents and non-goals
- S9-04 decide provider adapter and deployment constraints
- S9-05 define MongoDB session/message schema consistent with current conventions
- S9-06 define platform and healthcare knowledge sources, provenance and review ownership
- S9-07 define emergency escalation and clinical safety wording with qualified review
- S9-08 define API contracts, threat model and synthetic evaluation set

Deliverables: repository map, architecture decision record, approved scope, API/data contracts, safety requirements, initial test cases.

## Sprint 10 — LLM, intent routing and dual RAG (Weeks 19–20)
**Goal:** deliver grounded responses for app-help and general healthcare Q&A.

Tasks:
- Build provider adapter with server-side credentials
- Implement intent routing and clarification for uncertain intent
- Ingest approved platform documentation into a platform corpus
- Ingest approved healthcare documents into a separate healthcare corpus
- Implement retrieval, source metadata, citations and grounded generation
- Add no-evidence response behavior, prompt-injection defenses, limits and timeouts
- Add automated tests for routing, retrieval and citation integrity

Deliverables: working service-level assistant with two separated retrieval domains and evidence-based responses.

## Sprint 11 — Frontend and authorized app workflows (Weeks 21–22)
**Goal:** integrate the assistant into the real application.

Tasks:
- Build responsive React chat interface
- Add authenticated Express chat endpoints
- Persist sessions/messages in MongoDB
- Add bounded conversation context and retention/deletion behavior
- Connect only approved, allow-listed app tools
- Add patient report/assessment explanation using authorized, confirmed values
- Add appointment/queue/follow-up assistance only where existing APIs support it
- Require explicit confirmation before consequential mutations
- Add feedback, human handoff and language support where feasible

Deliverables: end-to-end assistant integrated with existing SwasthyaCare workflows.

## Sprint 12 — Evaluation, safety and controlled release (Weeks 23–24)
**Goal:** demonstrate reliable, secure and bounded behavior.

Tasks:
- Test groundedness, source accuracy and citation validity
- Test unsafe medical prompts and emergency scenarios with clinically reviewed expected behavior
- Test prompt injection and malicious retrieved content
- Test cross-patient and cross-role access
- Test appointment confirmation and server-side revalidation
- Test deletion/retention, provider outage, rate limits and logging
- Evaluate English/Hindi quality if both are released
- Fix defects, run regression and prepare controlled demo release

Deliverables: test report, risk register, release checklist, operational runbook and controlled demo.

## Definition of Ready
A task has an owner, acceptance criteria, dependencies, security/privacy impact and test approach. Medical content has an identified reviewer.

## Definition of Done
Code reviewed; tests pass; authorization enforced server-side; logs exclude unnecessary sensitive content; documentation updated; failure behavior tested; product and safety acceptance recorded.

## Priority
P0: core Q&A, app help, auth, source grounding, safe fallback, chat persistence, security.
P1: report explanation, appointment assistance, human handoff, feedback, bilingual support.
P2: voice, proactive suggestions, richer summaries and additional integrations.
