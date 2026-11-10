# SwasthyaCare — Machine Learning Access Control & Security Specification
## Task ML-S2-07: Role-Based Authorization, Network Isolation & Anti-Abuse Controls

**Document ID:** SWC-ML-AC-001  
**Sprint:** Sprint 2 — Input Contracts, Safe Data Pipeline & Preprocessing  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Security Specification  

---

## 1. Security Architecture & Threat Model

The SwasthyaCare ML inference architecture follows a **Zero-Trust Internal Network Model**. The Python FastAPI microservice (`ai-service:8000`) is strictly an internal daemon bound to the private loopback/Docker network (`127.0.0.1` or internal container network). It is **never exposed to the public Internet or direct browser traffic**.

```
[ Public Internet / Browser Client ]
                 │
                 │ HTTPS (TLS 1.3) + Bearer JWT
                 ▼
     [ Express Gateway :3001 ]
     ├── authenticateJWT (Token verification & blacklist check)
     ├── authorizeRoles('patient', 'doctor', 'admin')
     ├── rateLimitMiddleware (Anti-abuse throttling)
     ├── auditLogger (HIPAA compliance logging)
                 │
                 │ Internal Mutual Auth (Shared Secret: X-Internal-Token)
                 ▼
     [ FastAPI Microservice :8000 ]
     ├── Internal Token Validation
     ├── Pydantic Input Validation
     └── Scikit-Learn Inference Pipeline
```

---

## 2. Role-Based Access Control (RBAC) Matrix

| Actor / Role | Run ML Assessment | View Assessment History | View Raw Patient Biomarkers | Access Aggregated Telemetry | Re-train / Deploy Models |
|---|:---:|:---:|:---:|:---:|:---:|
| **Patient** | ✅ Self only (`req.user.id === patientId`) | ✅ Self only | ✅ Self only | ❌ Denied | ❌ Denied |
| **Doctor** | ✅ Assigned patients & self-assessment | ✅ Assigned patients | ✅ Clinical consultation context | ❌ Denied | ❌ Denied |
| **Admin** | ❌ Cannot trigger personal tests | ❌ Denied (PHI protected) | ❌ Denied (PHI protected) | ✅ De-identified metrics only | ✅ Deployment approvals |
| **Guest / Anonymous** | ❌ HTTP 401 Unauthorized | ❌ HTTP 401 Unauthorized | ❌ HTTP 401 Unauthorized | ❌ HTTP 401 Unauthorized | ❌ HTTP 401 Unauthorized |

### 2.1 Role-Specific Policies

#### 1. Patient Role
* **Principle of Least Privilege:** Patients can only invoke assessments where the target subject is their own authenticated user ID.
* **Tamper Prevention:** If a patient attempts to pass another patient's ID in the request body, the Express Gateway immediately aborts with `HTTP 403 Forbidden` (`AUTH_FORBIDDEN_PATIENT_MISMATCH`).
* **Rate Limiting:** Maximum **10 assessment runs per hour per patient** across all disease modules to prevent resource exhaustion and compulsive re-testing anxiety.

#### 2. Doctor Role
* **Clinical Context:** Doctors can invoke assessments on behalf of patients who have an active appointment, confirmed consultation, or assigned relationship.
* **Clinical Annotation:** Doctors are authorized to attach clinical notes (`doctorNotes`) to an assessment record in MongoDB `riskAssessments`.
* **Rate Limiting:** Maximum **60 assessment runs per hour per doctor**.

#### 3. Administrator Role
* **Privacy By Design:** System administrators oversee cluster health, API throughput, model latency percentiles (p50, p95, p99), and prediction distribution drift.
* **Zero PHI Exposure:** Admin dashboards display de-identified aggregate telemetry exclusively. Admins have zero access to raw individual patient biomarker payloads.

---

## 3. Internal Microservice Authentication Handshake

The Express Gateway and FastAPI microservice communicate using an internal shared secret authentication header:

1. **Header Name:** `X-Internal-Service-Key`
2. **Key Generation:** High-entropy 256-bit cryptographic key stored in environment variables (`INTERNAL_AI_SERVICE_SECRET`).
3. **Validation Middleware (FastAPI):**
   ```python
   # ai-service/app/core/security.py
   from fastapi import Security, HTTPException, status
   from fastapi.security.api_key import APIKeyHeader
   import os

   API_KEY_NAME = "X-Internal-Service-Key"
   api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

   async def verify_internal_rpc_key(api_key: str = Security(api_key_header)):
       expected_key = os.getenv("INTERNAL_AI_SERVICE_SECRET", "swasthya-internal-dev-key-2026")
       if api_key != expected_key:
           raise HTTPException(
               status_code=status.HTTP_403_FORBIDDEN,
               detail="Unauthorized internal RPC invocation"
           )
       return True
   ```
4. **Behavior on Direct Browser Call:** Any external request reaching port 8000 directly without the internal secret key is rejected immediately with `403 Forbidden`.

---

## 4. Anti-Abuse & Throttling Limits

| Endpoint Pattern | Window | Max Requests | Violation Action |
|---|---|---|---|
| `/api/ai/assessments/diabetes` (Patient) | 1 hour | 10 requests | HTTP 429 Too Many Requests |
| `/api/ai/assessments/cardiovascular` (Patient) | 1 hour | 10 requests | HTTP 429 Too Many Requests |
| `/api/ai/assessments/*` (Doctor) | 1 hour | 60 requests | HTTP 429 Too Many Requests |
| `/internal/v1/assessments/*` (Gateway -> FastAPI) | 1 minute | 600 requests | HTTP 429 & High-Volume Alert |

---

## 5. Audit Logging & Compliance Controls

Every assessment invocation generates a structured audit log entry adhering to HIPAA compliance:

```json
{
  "event": "ML_ASSESSMENT_EXECUTED",
  "task_id": "ML-DIA-01",
  "actor_id": "usr_patient_98231",
  "actor_role": "patient",
  "client_ip_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "model_id": "diabetes-current-status-lr",
  "model_version": "1.0.0",
  "execution_time_ms": 14.2,
  "status": "SUCCESS",
  "timestamp_utc": "2026-11-10T19:05:00.000Z"
}
```

*Note: Raw clinical biomarkers are NOT written to standard output or error monitoring services (such as Sentry or Datadog) to prevent HIPAA Safe Harbor data leakage.*

---
*Signed off for Sprint 2 — Task ML-S2-07.*
