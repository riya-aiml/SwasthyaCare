# Sprint 9 — Implementation Summary
## Conversational AI Assistant: Discovery, Product Foundation & Safety Design

**Document ID:** SWC-CB-S9-SUM  
**Sprint:** Sprint 9 — Discovery, Product Foundation and Safety Design (Weeks 17–18)  
**Parent Roadmap:** `Docs/Sprint/chatbot_feature.md`  
**Status:** ✅ COMPLETE  
**Date Completed:** 2026-11-11  
**Project:** SwasthyaCare — AI-Assisted Clinical Workflow & Disease Prediction System  

---

## 🎯 Sprint Goal
Establish the technical architecture, zero-trust security boundaries, clinical safety guardrails, dual-scope knowledge taxonomy, data schemas, and API contracts for integrating an enterprise-grade conversational AI assistant into SwasthyaCare without disrupting existing application services or machine learning pipelines.

---

## ✅ Tasks Completed

| Task ID | Task Description | Priority | Status | Output Deliverable |
|:---:|---|:---:|:---:|---|
| **S9-01** | Inspect current React, Express, MongoDB, FastAPI structure | Must | ✅ Done | Documented in [`Docs/chatbot/adr_architecture_and_orchestration.md`](../chatbot/adr_architecture_and_orchestration.md) |
| **S9-02** | Map authentication, roles, patient ownership, appointments, OCR, assessments | Must | ✅ Done | Architecture integration inventory in ADR Section 3 |
| **S9-03** | Decide orchestration location; avoid duplicate service/database logic | Must | ✅ Done | Express as gateway controller + FastAPI as internal RAG engine |
| **S9-04** | Finalize feature catalogue, user journeys, MVP vs later scope | Must | ✅ Done | [`Docs/chatbot/prd_and_feature_catalogue.md`](../chatbot/prd_and_feature_catalogue.md) |
| **S9-05** | Define intent taxonomy and separate healthcare/app knowledge scopes | Must | ✅ Done | [`Docs/chatbot/knowledge_source_register_and_taxonomy.md`](../chatbot/knowledge_source_register_and_taxonomy.md) |
| **S9-06** | Define chat session/message/feedback/action-confirmation data contracts | Must | ✅ Done | [`Docs/chatbot/data_contracts_and_api_specs.md`](../chatbot/data_contracts_and_api_specs.md) |
| **S9-07** | Define public Express API and internal AI-service contract | Must | ✅ Done | REST endpoints & Pydantic v2 / Mongoose schemas |
| **S9-08** | Register approved knowledge sources and app documentation owners | Must | ✅ Done | Scope A (App Docs) & Scope B (ICMR / WHO / MoHFW guidelines) |
| **S9-09** | Draft symptom, emergency, report, assessment and medicine guardrails | Must | ✅ Done | [`Docs/chatbot/clinical_safety_and_guardrails.md`](../chatbot/clinical_safety_and_guardrails.md) |
| **S9-10** | Define tool allow-list, action confirmation and human handoff flows | Must | ✅ Done | Read-only tools + Client confirmation cards for mutations |
| **S9-11** | Define retention/deletion, privacy and operational logging policy | Must | ✅ Done | Right to erasure (cascade session delete) & log sanitization |
| **S9-12** | Create synthetic evaluation set, threat scenarios and UX wireframes | Must | ✅ Done | [`Docs/chatbot/synthetic_evaluation_and_threat_scenarios.md`](../chatbot/synthetic_evaluation_and_threat_scenarios.md) |

---

## 🏛️ Core Architectural Decisions

1. **Multi-Tier Orchestration:**
   * **Express Gateway (`:3001`):** Authenticates patients with JWT, enforces session rate limits (25 req/min), enforces strict tenant data isolation (`req.user._id`), and persists chat history in MongoDB (`chatSessions` & `chatMessages`).
   * **FastAPI Microservice (`:8005`):** Protected by `X-Internal-Service-Key`, executes intent classification, emergency pre-checking, dual-scope vector retrieval, and citation verification.
2. **Dual-Scope Knowledge Base Segregation:**
   * **Scope A (App Workflows):** Markdown knowledge base of SwasthyaCare features (atomic booking, OPD queue, post-discharge check-ins, ML risk models).
   * **Scope B (Clinical Guidelines):** Verified medical sources (ICMR Diabetes 2023, ICMR Hypertension 2022, WHO Cardiovascular Guidelines 2021).
3. **Emergency Preemption Protocol:**
   * Acute cardiovascular (chest pain, left arm radiation), stroke (FAST criteria), and respiratory distress trigger immediate 112/108 emergency cards, locking automated chat.
4. **Zero Unilateral Mutations:**
   * The assistant cannot directly create, update, or cancel appointments or alter medical data. All actions are returned as interactive confirmation cards requiring patient clicks.
5. **Right to Erasure:**
   * Patients have full control to view and permanently delete their chat history via `DELETE /api/chat/sessions/:id`.

---

## ⏭️ Ready for Sprint 10
All **Definition of Done (DoD)** criteria for Sprint 9 have been satisfied.
* **Sprint 10 Objective:** LLM Integration, Grounded RAG & Core Q&A (`S10-01` to `S10-10`).
  * Implement internal FastAPI endpoint `POST /internal/v1/chat/message`.
  * Ingest Scope A and Scope B markdown documentation into vectorized retrieval indexes.
  * Build intent classifier and prompt injection defense layers.
  * Build citation verification and deterministic fallback engine.
