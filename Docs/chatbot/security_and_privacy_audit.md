# Security & Privacy Audit Report
## Multi-Tenant Authorization, Right to Erasure & Credential Sanitization

**Document ID:** SWC-CB-SEC-001  
**Sprint:** Sprint 12 — Advanced Capability Validation, Safety QA & Controlled Release (Tasks `S12-04`, `S12-05`, `S12-10`)  
**Status:** ✅ CERTIFIED COMPLIANT  
**Date:** 2026-11-11  
**Scope:** Express Gateway (`:3001`), MongoDB (`chatSessions`, `chatMessages`), and Python FastAPI Microservice (`:8005`)  

---

## 1. Multi-Tenant Patient Data Isolation (Task S12-04)

### 1.1 Architecture & Threat Model
In an enterprise clinical platform, patients must never be able to inspect, alter, or inject data into conversations belonging to another patient.

### 1.2 Access Control Rules
* **Authentication Gate:** Every chat route under `/api/chat` requires valid JWT Bearer authentication. Unauthenticated requests are rejected with HTTP 401 Unauthorized.
* **Ownership Verification:** On `GET /api/chat/sessions/:id`, `POST /api/chat/sessions/:id/messages`, and `DELETE /api/chat/sessions/:id`, the session’s `patient` reference is verified against `req.user._id`.
* **Cross-Tenant Access Rejection:** If `session.patient !== req.user._id`, the server immediately terminates the request with **HTTP 403 Forbidden**.
* **Audit Result:** Verified by test cases `3.1` and `3.2` in `chatbot_release_gate_sprint12.test.js`.

---

## 2. Right to Erasure & Cascading Deletion (Task S12-05)

### 2.1 Regulatory Standard
In accordance with **GDPR Article 17** and the **Indian Digital Personal Data Protection (DPDP) Act**, patients hold the sovereign Right to Erasure of their health conversation records.

### 2.2 Cascading Deletion Implementation
* Endpoint: `DELETE /api/chat/sessions/:id`
* Ownership is strictly validated.
* Atomic cascade execution:
  ```javascript
  await ChatMessage.deleteMany({ session: id, patient: patientId });
  await ChatSession.findByIdAndDelete(id);
  ```
* Subsequent requests for the deleted session return **HTTP 404 Not Found**.
* **Audit Result:** Verified by test case `3.3` in `chatbot_release_gate_sprint12.test.js`.

---

## 3. Credential & PII Sanitization in Logging (Task S12-10)

* **Internal Service Key:** The `X-Internal-Service-Key` is strictly scoped to server-to-server RPC between Node.js and FastAPI. It is never transmitted to the browser client.
* **Operational Log Sanitization:** Server request loggers do not log sensitive conversation body strings or authorization tokens in cleartext.
* **Audit Result:** Verified by test case `4.2` in `chatbot_release_gate_sprint12.test.js`.
