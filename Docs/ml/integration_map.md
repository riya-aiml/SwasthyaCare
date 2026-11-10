# SwasthyaCare — ML Integration Map & System Architecture
## Task ML-S1-01 & ML-S1-02: Codebase Mapping & Service Mount Topology

**Document ID:** SWC-ML-IM-001  
**Sprint:** Sprint 1 — ML Discovery & Problem Definition  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Architectural Baseline  

---

## 1. Executive Summary & Non-Negotiable Integration Rules

This document maps the running SwasthyaCare monorepo to establish clean, non-disruptive integration points for the Machine Learning workstream. In accordance with Section 1 of the integration specification:
1. **Zero Disruption to Existing Services:** All existing working routes, authentication flows, CAS appointment booking, and post-discharge follow-up modules remain completely operational and unchanged.
2. **Polyglot Service Decoupling:** The ML service is housed strictly within the standalone Python/FastAPI microservice (`ai-service/`), preserving Node.js event-loop throughput.
3. **No Direct Client-to-ML Access:** The browser client (`React 18 SPA`) NEVER accesses the FastAPI ML service directly. All requests pass through the Node.js Express Domain Gateway, which handles JWT authentication, RBAC authorization, rate limiting, and assessment history persistence in MongoDB.

---

## 2. Current System Architecture & Component Mapping

```
                                [ Client Workstation / Browser ]
                                      React 18 SPA (Port 3000)
                                      Vite 5 + Tailwind CSS 3.4
                                                 │
                                                 │ HTTPS / JSON (JWT Dual-Key Auth)
                                                 ▼
                                [ Express Domain Gateway (Port 3001) ]
                                           Node.js 18+
                     ┌───────────────────────────┼───────────────────────────┐
                     │                           │                           │
                     ▼                           ▼                           ▼
          [ Auth & User Modules ]     [ Scheduling & Follow-Up ]      [ AI Gateway Proxy ]
          - POST /api/auth/login      - POST /api/appointments/req   - POST /api/ai/predict/...
          - POST /api/auth/register   - PATCH /api/appointments/st   - GET /api/ai/health
          - GET /api/auth/me          - POST /api/follow-ups/plans   - POST /api/ai/ocr/medicine
                     │                           │                           │
                     │                           │                           │ Internal HTTP RPC
                     ▼                           ▼                           │ (Non-public network)
        [ MongoDB 8.0 (Port 27017) ] <───────────┴───────────────────────────┼───────────┐
        Collections:                                                         │           │
        - users, doctorprofiles                                              ▼           │
        - availabilityslots (Atomic CAS)                           [ FastAPI ML Service ] │
        - appointments, followupplans                              (Port 8000, Python)    │
        - followUpCheckIns, notificationjobs                       - Pydantic v2 Schemas  │
        - riskAssessments (NEW in Sprint 7) <────────────────────────────────────────────┘
```

---

## 3. Directory & File Inventory (Repository Map)

### 3.1 Frontend (`/client`)
* **Framework:** React 18.3.1, Vite 5.4, Tailwind CSS 3.4.17, Lucide React icons.
* **Network Gateway:** `vite.config.js` proxies `/api` requests to `http://localhost:3001`.
* **State & Authentication:**
  * `client/src/services/authService.js`: Dual-key token persistence (`authToken` and `token` fallback) providing `getAuthHeaders()`.
  * `client/src/services/aiService.js`: Consumes `/api/ai/*` endpoints with bearer token injection.
* **UI Views for ML Integration:**
  * `client/src/components/RiskAssessmentView.jsx`: Dedicated clinical risk and prediction assessment screen.
  * `client/src/components/MedicineOCRView.jsx`: Medicine packaging OCR scanner and candidate matcher.
  * Sticky Top **1-Click Test Persona Ribbon** (`App.Sprint7.jsx`): Enables instant identity switching between Patient, Doctor, Management, and Admin.

### 3.2 Backend Gateway (`/server`)
* **Framework:** Node.js Express REST API, Mongoose 8 ODM.
* **Security Middleware:** Helmet, CORS, Express-Rate-Limit, Mongo-Sanitize, Bcrypt (10 rounds).
* **Authentication Guard:** `server/src/middleware/auth.js` (`authenticate` and `requireRole`).
* **Existing AI Route Mount:** `server/src/app.js` mounts `server/src/modules/ai/ai.routes.js` at `/api/ai`.
* **Proxy Controller:** `server/src/modules/ai/ai.controller.js` forwards requests to `AI_SERVICE_URL` (default: `http://localhost:8000`) with timeout and circuit-breaker fallbacks.

### 3.3 Python ML Service (`/ai-service`) — Mount Point
* **Framework:** Python 3.11+, FastAPI, Uvicorn, Pydantic v2.
* **Environment:** Isolated virtualenv at `ai-service/venv`.
* **Installed Scientific Libraries:** `pandas`, `numpy`, `scikit-learn`, `scipy`, `joblib`, `ucimlrepo`.
* **Existing Structure:**
  * `app/main.py`: ASGI application entry point and health probe (`GET /health`).
  * `app/routers/predict.py`: Current risk inference routes (`/api/v1/predict/*`).
  * `app/routers/ocr.py`: Medicine packaging OCR routes (`/api/v1/ocr/*`).
  * `app/schemas/`: Pydantic data models enforcing strict biological and clinical bounds.
* **Extension Structure for ML Integration:**
  * `ai-service/data/`: Local storage for dataset benchmark copies (git-ignored).
  * `ai-service/training/`: Reproducible training scripts, data profiling, and evaluation pipelines.
  * `ai-service/artifacts/`: Versioned serialized model pipelines (`.joblib`) with metadata.

---

## 4. End-to-End Request & Network Flow

To ensure strict compliance with HIPAA privacy standards and FDA SaMD guidelines, the communication pipeline follows a zero-trust 4-tier traversal:

```
[ Step 1: Patient Action ]
Patient fills assessment form on React SPA (e.g., Blood Pressure, Cholesterol, BMI).
       │
       ▼
[ Step 2: Gateway Security & Authentication ]
Client dispatches POST to /api/ai/assessments/:diseaseType with Authorization: Bearer <JWT>.
Express authenticate middleware verifies JWT signature and extracts patientId.
       │
       ▼
[ Step 3: Server-to-Server Internal RPC ]
Express controller validates payload format and forwards request to:
FastAPI: http://127.0.0.1:8000/internal/v1/assessments/:diseaseType/:taskType
(FastAPI validates Pydantic schema, applies fitted transformers, runs model inference).
       │
       ▼
[ Step 4: Structured Response & Audit Persistence ]
FastAPI returns standardized envelope:
{
  "task_id": "ML-CVD-01",
  "model_id": "cardiovascular-current-status-lr",
  "model_version": "1.0.0",
  "prediction": 1,
  "probability": 0.64,
  "output_label": "Indicators Suggestive of Significant Coronary Artery Disease Pattern",
  "limitations": ["Educational prototype only", "Not a medical diagnosis"],
  "timestamp_utc": "2026-11-10T12:00:00Z"
}
Express saves metadata to MongoDB `riskAssessments` collection:
{ patientId, taskId, modelId, modelVersion, prediction, probability, createdAt }.
Express responds to React client with clean, shaped JSON.
```

---

## 5. Security & Isolation Boundaries

1. **Network Isolation:** In production (Docker / Kubernetes), the `ai-service` container is attached to an internal private bridge network. It does NOT publish ports to public ingress; only the `server` container can reach port 8000.
2. **Access Control:** All assessment routes require valid JWT tokens. Cross-patient history access is strictly blocked (`patientId === req.user.id`).
3. **Resilience & Fallback:** If `ai-service` experiences high load or downtime, `server/src/modules/ai/ai.controller.js` catches the timeout and returns `HTTP 503 Service Unavailable` with a safe clinical notice, never crashing appointment booking or user authentication.

---
*Signed off for Sprint 1 — Task ML-S1-01 & ML-S1-02.*
