# Architecture Decision Record (ADR): Chatbot & AI Assistant Integration
## Multi-Tier Zero-Trust Orchestration, Identity Propagation & Knowledge Isolation

**Document ID:** SWC-CB-ADR-001  
**Sprint:** Sprint 9 — Discovery, Product Foundation & Safety Design (Tasks `S9-01`, `S9-02`, `S9-03`, `S9-07`)  
**Status:** ✅ APPROVED  
**Date:** 2026-11-11  
**Component:** SwasthyaCare Conversational AI Assistant Subsystem  

---

## 1. Context & Problem Statement

SwasthyaCare is an integrated clinical management and decision support platform comprising:
1. **Frontend:** React 18 Single Page Application (SPA) with role-based dashboards (`patient`, `doctor`, `admin`, `hospital_management`).
2. **Gateway:** Node.js Express API Gateway (`:3001`) managing JWT authentication, role authorization, atomic booking with CAS locking, follow-up triage, and MongoDB persistence.
3. **Internal AI Microservice:** Python FastAPI (`:8005`) executing ML risk scoring (`ML-DIA-01`, `ML-CVD-01`), Framingham calculators, and medicine packaging OCR.
4. **Database:** MongoDB maintaining user profiles, doctor schedules, appointments, follow-up plans, notifications, and `riskAssessments`.

The objective of Sprints 9–12 is to introduce a patient-facing conversational AI assistant that:
* Answers app usage questions (appointment booking, doctor schedules, triage queue).
* Explains calculated risk assessments (`ML-DIA-01`, `ML-CVD-01`) and confirmed laboratory reports.
* Answers general lifestyle and public health questions grounded in certified clinical knowledge (ICMR, WHO, MoHFW).
* Tunnels emergency medical red-flags immediately to emergency hotlines (112 / 108).
* Never acts autonomously on medical diagnoses, prescription alterations, or unconfirmed appointment changes.

---

## 2. Decision: Service Boundary & Orchestration Location (`S9-03`)

### Evaluated Alternatives
* **Option A: Client-to-LLM / Client-to-FastAPI Direct Access**  
  * *Rejected.* Exposes internal API keys, bypasses Express JWT authorization, violates patient data isolation, and makes audit logging impossible.
* **Option B: Pure Node.js RAG & LLM Execution**  
  * *Rejected.* Requires re-implementing vector embeddings, chunking, and ML tokenizers in JavaScript, duplicating Python infrastructure already established in `ai-service/`.
* **Option C: Hybrid Gateway + Specialized AI Microservice (SELECTED)**  
  * **Express (:3001):** Acts as the public authenticated gatekeeper. Enforces JWT auth, session rate limits, patient ownership validation, session persistence, and patient context enrichment.
  * **FastAPI (:8005):** Acts as the internal stateless reasoning and retrieval engine. Performs intent routing, dual-scope vector search, safety pre-checking, citation enforcement, and grounded answer synthesis.
  * **Communication:** Internal server-to-server HTTP RPC secured by `X-Internal-Service-Key` over isolated network bridge.

```text
[ Browser Client (React 18 SPA) ]
                │
                │ HTTPS (JWT Bearer Token in Header)
                ▼
[ Node.js Express Gateway (:3001) ]
  ├── 1. Authentication & Rate-Limiter (express-rate-limit: max 25 req/min per user)
  ├── 2. Session & Ownership Guard (req.user._id matching chatSessions.patient)
  ├── 3. Patient Context Assembly (Retrieves ONLY patient-confirmed OCR & ML assessments)
  └── 4. MongoDB Persistence (chatSessions, chatMessages)
                │
                │ Internal Private RPC (X-Internal-Service-Key)
                ▼
[ Python FastAPI AI Microservice (:8005) ]
  ├── 1. Intent Router & Red-Flag Triage Guard (Regex + Semantic classifier)
  ├── 2. Vector Retrieval Engine (ChromaDB / BM25 hybrid):
  │        ├── Scope A: SwasthyaCare App Knowledge Base (Markdown chunks)
  │        └── Scope B: Clinical Public Health Guidelines (ICMR / MoHFW)
  ├── 3. Grounded Prompt Assembly & LLM Adapter (Provider API / Deterministic fallback)
  ├── 4. Citation Verifier & SaMD Post-Filter (Injects educational disclaimers)
  └── 5. Structured JSON Response Serialization
```

---

## 3. Existing Architecture Integration Map (`S9-01`, `S9-02`)

| Domain | Existing SwasthyaCare Component | Chatbot Integration Hook | Security / Data Isolation Boundary |
|---|---|---|---|
| **Identity & Auth** | `server/src/middleware/auth.js` (`authenticate`) | Protects `/api/chat/*` routes | Strictly verifies `req.user._id`. Patients cannot query other patients' chat sessions. |
| **Appointments** | `server/src/modules/appointments/` | Tool recommendation (`ACTION_SUGGESTION`) | Chatbot **cannot** unilaterally book/cancel appointments; it returns an action card requiring patient explicit one-click confirmation. |
| **Lab OCR Data** | `server/src/modules/ai/ocr.controller.js` | Medical report explanation | Chatbot only references values where `patientConfirmed: true`. Unconfirmed OCR values are masked. |
| **Risk Scoring** | `riskAssessments` collection (MongoDB) | Assessment factor explanation | Chatbot pulls specific `assessmentId` belonging to authenticated patient; quotes exact calibrated probability and model version (`1.0.0`). |
| **Queue & Follow-Up**| `server/src/modules/followup/` | Recovery check-in assistance | Read-only guidance. Triage alerts trigger clinician escalation advice. |

---

## 4. Zero-Trust Internal RPC Protocol (`S9-07`)

### Internal Endpoint Specifications (FastAPI `:8005`)

1. **`POST /internal/v1/chat/message`**
   * **Headers:** `X-Internal-Service-Key: <INTERNAL_AI_SERVICE_SECRET>`
   * **Payload:**
     ```json
     {
       "session_id": "67320b9a8f1e2c0012345678",
       "user_id": "67320a1b8f1e2c0012345670",
       "message": "Why is my diabetes risk elevated?",
       "locale": "en",
       "patient_context": {
         "latest_assessment": {
           "task_id": "ML-DIA-01",
           "probability": 0.68,
           "output_label": "Reported Profile Consistent with Elevated Diabetes Indicator Pattern",
           "contributing_factors": ["High Blood Pressure", "BMI 29.5 kg/m²", "Sedentary Activity"]
         },
         "confirmed_vitals": {
           "systolic_bp": 138,
           "diastolic_bp": 88
         }
       }
     }
     ```
   * **Response:**
     ```json
     {
       "response_id": "resp_987654321",
       "intent": "ASSESSMENT_EXPLANATION",
       "content": "Your latest assessment (ML-DIA-01, v1.0.0) indicated an elevated pattern primarily due to self-reported elevated blood pressure and a BMI of 29.5 kg/m²...",
       "citations": [
         {
           "source_id": "ICMR-DIA-2023-SEC4",
           "title": "ICMR Guidelines for Management of Type 2 Diabetes",
           "url_or_section": "Section 4.2: Lifestyle Interventions"
         }
       ],
       "action_suggestion": {
         "type": "NAVIGATE_TAB",
         "target": "risk-assessment",
         "label": "View Full Assessment Audit"
       },
       "is_emergency": false,
       "disclaimer": "EDUCATIONAL PROTOTYPE ONLY: This assistant provides non-diagnostic information. Always consult a physician for medical diagnosis."
     }
     ```

---

## 5. Architectural Invariants

1. **No External Secrets in Client:** API keys for external LLM providers (e.g., Anthropic Claude / OpenAI / local Ollama) reside strictly in `ai-service/.env` and `server/.env`. They are never passed to the browser.
2. **Determinism & Fallback Guarantee:** If an external LLM provider encounters rate limiting, network timeout, or downtime, the FastAPI microservice automatically switches to a local deterministic retrieval rule engine without dropping the user's connection.
3. **No Unilateral Mutations:** The chatbot can **never** execute database writes to appointments, prescriptions, or user profiles. All actionable intents are returned as confirmation cards requiring explicit user clicks.
4. **Data Minimization:** Raw chat logs stored in MongoDB strip sensitive credential tokens and do not log passwords or payment information.
