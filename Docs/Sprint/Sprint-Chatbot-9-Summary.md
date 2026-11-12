# Sprint 9 — Implementation Summary
## Chatbot Discovery, Architecture & Product Foundation

**Document ID:** SWC-CHAT-S9-SUM  
**Sprint:** Sprint 9 — Discovery and Product Foundation  
**Parent Roadmap:** `Docs/Sprint/SwasthyaCare_Hybrid_AI_Assistant_Sprint_Plan_S9-S12_v1.2.md`  
**Status:** ✅ COMPLETE  
**Date Completed:** 2026-11-12  
**Project:** SwasthyaCare — Hybrid Conversational AI Assistant & Clinical Guardrails  

---

## 🎯 Sprint Goal
Understand the real repository codebase, map user roles and patient-context authorization, finalize product requirements and non-goals, decide provider adapters and deployment constraints, define MongoDB session/message schemas, establish the dual-corpus knowledge source registers, define emergency escalation protocols with clinical safety review, and deliver API contracts, threat models, and synthetic evaluation test sets.

---

## ✅ Tasks Completed

| Task ID | Task Description | Priority | Status | Output Deliverable |
|:---:|---|:---:|:---:|---|
| **S9-01** | Inspect repository, current routes, auth, database models, AI service and existing workflows | Must | ✅ Done | [`Docs/chatbot/repository_map_and_architecture.md`](../chatbot/repository_map_and_architecture.md) |
| **S9-02** | Map user roles and patient-context authorization | Must | ✅ Done | [`Docs/chatbot/repository_map_and_architecture.md`](../chatbot/repository_map_and_architecture.md) |
| **S9-03** | Finalize product requirements, intents and non-goals | Must | ✅ Done | [`Docs/chatbot/prd_and_feature_catalogue.md`](../chatbot/prd_and_feature_catalogue.md) |
| **S9-04** | Decide provider adapter and deployment constraints | Must | ✅ Done | [`Docs/chatbot/adr_architecture_and_orchestration.md`](../chatbot/adr_architecture_and_orchestration.md) |
| **S9-05** | Define MongoDB session/message schema consistent with current conventions | Must | ✅ Done | [`server/src/modules/chat/chatSession.model.js`](../../server/src/modules/chat/chatSession.model.js) & [`server/src/modules/chat/chatMessage.model.js`](../../server/src/modules/chat/chatMessage.model.js) |
| **S9-06** | Define platform and healthcare knowledge sources, provenance and review ownership | Must | ✅ Done | [`Docs/chatbot/knowledge_source_register_and_taxonomy.md`](../chatbot/knowledge_source_register_and_taxonomy.md) |
| **S9-07** | Define emergency escalation and clinical safety wording with qualified review | Must | ✅ Done | [`Docs/chatbot/clinical_safety_and_guardrails.md`](../chatbot/clinical_safety_and_guardrails.md) |
| **S9-08** | Define API contracts, threat model and synthetic evaluation set | Must | ✅ Done | [`Docs/chatbot/data_contracts_and_api_specs.md`](../chatbot/data_contracts_and_api_specs.md), [`Docs/chatbot/threat_model_and_evaluation_suite.md`](../chatbot/threat_model_and_evaluation_suite.md), & [`ai-service/app/schemas/chat_assistant.py`](../../ai-service/app/schemas/chat_assistant.py) |

---

## 🏗️ Architecture & Decisions Established

1. **Gateway-Orchestrated Hybrid Dual-RAG Architecture (ADR-009):**
   - Express server acts as the secure entry point: authenticates users via JWT, persists chat history in MongoDB, limits turns to 10 to avoid unbounded context growth, and guards database mutations behind an explicit two-step client confirmation card.
   - Internal RPC forwards requests to Python FastAPI `ai-service` using `X-Internal-Service-Key` shared secret.
   - Two physically isolated retrieval corpora:
     - **Platform Corpus:** SwasthyaCare appointments, OPD queue, post-discharge follow-ups, and risk model docs.
     - **Healthcare Corpus:** Peer-reviewed ICMR guidelines (Diabetes, Hypertension), WHO cardiovascular prevention, and NIMHANS mental health protocols.
2. **Pluggable Provider Abstraction:**
   - Production cloud support for Anthropic Claude and OpenAI.
   - Built-in zero-dependency **Deterministic Fallback/Mock Adapter** enabling 100% offline development, zero API costs during CI/CD, and resilience during external provider outages.
3. **Emergency Escalation (Priority 0):**
   - Clinical red-flag triggers (acute chest pain, FAST stroke symptoms, respiratory distress, anaphylaxis, suicide ideation) bypass normal RAG.
   - Immediate escalation to Indian National Helplines: **112** (Unified Emergency), **108** (Ambulance), **14416** / **1800-599-0019** (Tele-MANAS/KIRAN).
4. **Threat Defense (STRIDE + OWASP Top 10 for LLM):**
   - Anti-prompt injection, delimited system instructions, token caps (1,000 chars/message, 30 req/min rate limit), zero cross-patient IDOR.

---

## 📁 Artifacts Produced in Sprint 9

* [`Docs/chatbot/repository_map_and_architecture.md`](../chatbot/repository_map_and_architecture.md) — Comprehensive audit of Express routes, auth flow, Mongoose models, and FastAPI integration.
* [`Docs/chatbot/adr_architecture_and_orchestration.md`](../chatbot/adr_architecture_and_orchestration.md) — ADR-009 deciding hybrid dual-RAG, provider abstraction, and deployment constraints.
* [`Docs/chatbot/prd_and_feature_catalogue.md`](../chatbot/prd_and_feature_catalogue.md) — Product requirements, priority intent hierarchy, and explicit non-goals.
* [`Docs/chatbot/knowledge_source_register_and_taxonomy.md`](../chatbot/knowledge_source_register_and_taxonomy.md) — Register of approved ICMR/WHO clinical guides and SwasthyaCare platform documentation.
* [`Docs/chatbot/clinical_safety_and_guardrails.md`](../chatbot/clinical_safety_and_guardrails.md) — Clinical safety guidelines, red-flag triggers, emergency escalation, and physician sign-off.
* [`Docs/chatbot/data_contracts_and_api_specs.md`](../chatbot/data_contracts_and_api_specs.md) — REST and internal RPC contracts, headers, payloads, and HTTP error specs.
* [`Docs/chatbot/threat_model_and_evaluation_suite.md`](../chatbot/threat_model_and_evaluation_suite.md) — STRIDE threat analysis and 25 synthetic adversarial test cases.
* [`server/src/modules/chat/chatSession.model.js`](../../server/src/modules/chat/chatSession.model.js) — Mongoose model for conversation sessions.
* [`server/src/modules/chat/chatMessage.model.js`](../../server/src/modules/chat/chatMessage.model.js) — Mongoose model for chat messages with intent, citations, and feedback tracking.
* [`ai-service/app/schemas/chat_assistant.py`](../../ai-service/app/schemas/chat_assistant.py) — Pydantic schemas for intent routing and RPC contracts.

---

## ⏭️ Ready for Sprint 10
All **Definition of Ready (DoR)** criteria for Sprint 10 are satisfied:
* **Sprint 10 Goal:** LLM Provider Adapter, Intent Routing, and Dual RAG (Platform & Healthcare corpora ingestion, grounded responses, no-evidence fallbacks, and automated test suite).
