# SwasthyaCare Repository Map & System Integration Architecture

**Task ID:** S9-01, S9-02  
**Sprint:** Sprint 9 (Discovery and Product Foundation)  
**Date:** 2026-11-12  
**Status:** APPROVED & AUDITED  

---

## 1. System Overview & Technology Stack

SwasthyaCare is an enterprise digital health and clinical decision support system designed with a microservices-aligned architecture:

| Component | Technology | Directory | Primary Role |
| :--- | :--- | :--- | :--- |
| **Backend Gateway** | Node.js (v18+), Express (v4.19), Mongoose (v8.3) | `server/` | API routing, JWT auth, RBAC, appointment booking, follow-ups, MongoDB persistence |
| **AI Microservice** | Python (3.11+), FastAPI, Pydantic (v2), PyTorch/Scikit-learn | `ai-service/` | CVD/Diabetes ML risk models, medicine packaging OCR, dual-corpus vector search & RAG |
| **Frontend Web Client**| React 18, Vite, Tailwind CSS, Lucide Icons | `client/` | Responsive patient portal, clinician workspace, live OPD queue, assistive chat interface |
| **Database** | MongoDB (v7.x) / MongoDB Atlas | External | Multi-collection document store with ACID transaction support |

---

## 2. Express Backend Audit & Route Table (Task S9-01)

The backend entry point is `server/src/app.js`. All API endpoints are mounted under `/api`:

| Route Prefix | Module / Controller | Auth Level | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/health` | `health.routes.js` | Public | System liveness, readiness, and DB connection probe |
| `/api/auth` | `auth.routes.js` | Public | User registration (`/register`), login (`/login`), token refresh |
| `/api/users` | `user.routes.js` | Authenticated | Profile retrieval, user management, emergency contact info |
| `/api/doctors` | `doctor.routes.js` | Public / Doctor | Doctor profile discovery, specialty search, slot management |
| `/api/appointments` | `appointment.routes.js` | Patient / Doctor | Slot booking, appointment status state-machine (PENDING/APPROVED/CANCELLED) |
| `/api/follow-ups` | `followUp.routes.js` | Patient / Doctor | Post-discharge care plans, recovery check-in submissions, automated alerts |
| `/api/ai` | `ai.routes.js` | Authenticated | Express gateway proxying requests to FastAPI internal ML models |
| `/api/assessments` | `assessment.routes.js` | Patient / Doctor | Persisted ML risk assessments (`ML-DIA-01`, `ML-CVD-01`), clinical history |
| `/api/dashboards` | `dashboard.routes.js` | Role-based | Aggregated metrics for patients, clinicians, and hospital administrators |

---

## 3. User Roles & Patient-Context Authorization Matrix (Task S9-02)

The system strictly enforces role-based access control via `authenticate` and `authorize(...)` middleware in `server/src/middleware/auth.js`.

### 3.1 Role Hierarchy

```
                      [ System Administrator ]
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
        [ Clinician / Doctor ]     [ Hospital Management ]
                   │
                   ▼
          [ Patient (End-User) ]
```

### 3.2 Authorization & Data Isolation Rules

| Role | Role Identifier | Scope of Access | Chatbot Capability Constraints |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient` | Own user record (`req.user.id`), own appointments, own clinical assessments, own follow-ups. | Can query own appointments, own risk assessments, ask general health Q&A, request appointments. **Zero cross-patient access**. |
| **Doctor** | `doctor` | Own profile, assigned OPD appointments, assigned follow-up recovery plans, all patient assessments under their care. | Can query assigned patient histories, summarize clinical notes, check daily appointment queue. |
| **Hospital Management**| `hospital_management`| Departmental queue statistics, doctor shift schedules, hospital capacity metrics. | Operational inquiries, doctor load, wait-time queries. No access to private clinical chats. |
| **Administrator** | `admin` | Full user management, system audit logs, knowledge base index triggers. | Administrative audit, system diagnostics. |

---

## 4. FastAPI AI Service Audit

Mounted in `ai-service/app/main.py` with port 8000:
- **Port:** 8000
- **Internal RPC Guard:** `verify_internal_rpc_key` in `ai-service/app/core/security.py` checks header `X-Internal-Service-Key` matching `INTERNAL_AI_SERVICE_SECRET`.
- **Existing Endpoints:**
  - `POST /api/v1/predict/heart-risk`: Framingham-based cardiovascular risk estimator
  - `POST /api/v1/predict/diabetes-risk`: FINDRISC-based type 2 diabetes risk estimator
  - `POST /api/v1/ocr/medicine`: Medicine strip packaging text extraction
- **Integration Point for Chatbot (Sprint 10):**
  - `POST /api/v1/chat/internal-orchestrate`: Dual RAG retrieval (platform corpus + clinical corpus), intent classification, safe response synthesis.

---

## 5. Architectural Invariants for Chatbot Integration

1. **Client Isolation:** The React frontend NEVER directly contacts the FastAPI AI service or third-party LLM providers. All traffic routes through Express `/api/chat/*`.
2. **Server-Side Token Validation:** Every incoming chat request is authenticated with JWT; patient IDs are derived strictly from the verified token (`req.user.id`), never accepted from the request body.
3. **No Direct Model Mutations:** The assistant can prepare or draft an appointment or follow-up action, but NEVER finalizes a database mutation without an explicit client confirmation step.
4. **Strict Context Boundaries:** Chat sessions are bounded to a maximum of 10 conversational turns per query to avoid unbounded context expansion.
