# Security & Privacy Audit Report
## SwasthyaCare Conversational Health Assistant (Sprint 12)

**Document ID:** SWC-CHAT-S12-SEC  
**Sprint:** Sprint 12 — Evaluation, Safety & Controlled Release  
**Status:** PASSED (Zero High/Critical Vulnerabilities)  
**Date:** 2026-11-12  
**Audit Standard:** OWASP Top 10 for LLM Applications (2025) & DISHA/HIPAA Security Standards  

---

## 1. Vulnerability & Threat Assessment

| Threat / Test Category | Vulnerability Surface | Assessment Finding | Mitigation & Audit Verification |
| :--- | :--- | :---: | :--- |
| **Cross-Patient IDOR** | Patient A attempts to view, read, or post messages to Patient B's chat session. | **PROTECTED** | Enforced at service layer (`session.user.toString() === req.user._id.toString()`). Rejects with 403 Forbidden. Automated test verified in `chat_sprint11.test.js`. |
| **Unauthenticated API Access** | Anonymous requests to `/api/chat/*`. | **PROTECTED** | Express gateway router applies `authenticate` middleware. Rejects with 401 Unauthorized. |
| **Internal RPC Bypasses** | External direct calls to FastAPI `/api/v1/chat/internal-orchestrate`. | **PROTECTED** | Guarded by `verify_internal_rpc_key` verifying `X-Internal-Service-Key`. Direct external access rejected with 403 Forbidden. |
| **Token Exhaustion / DoS** | Malicious users sending oversized inputs to exhaust LLM context. | **PROTECTED** | Input length strictly clamped to 1,000 characters. Express rate limiter caps traffic at 30 req/min per user. |
| **Unilateral State Mutation** | Assistant executing appointments or medical updates without patient knowledge. | **PROTECTED** | Assistant can only emit `ActionProposal` with `status: 'proposed'`. Database changes require explicit client confirmation via `/confirm-action`. |
| **PHI Leakage in Server Logs** | Passwords, tokens, or raw medical symptoms exposed in server logs. | **PROTECTED** | Request loggers strip authorization headers and request bodies. Passwords hashed with bcrypt salt 10. |

---

## 2. Cross-Patient Penetration Test Matrix

```
[ Attacker: Patient B (JWT Token B) ]
      │
      ├─► GET /api/chat/sessions/:sessionA_Id ──────► [ 403 Forbidden: Access Denied ] ✅
      ├─► POST /api/chat/sessions/:sessionA_Id/messages ► [ 403 Forbidden: Access Denied ] ✅
      ├─► DELETE /api/chat/sessions/:sessionA_Id ────► [ 403 Forbidden: Access Denied ] ✅
      └─► POST /api/chat/messages/:messageA_Id/feedback ► [ 403 Forbidden: Access Denied ] ✅
```

---

## 3. Privacy & Compliance Sign-Off

- **Lead Security Architect:** SwasthyaCare Information Security Group
- **Compliance Verdict:** PASSED. Zero cross-tenant data leakage detected.
