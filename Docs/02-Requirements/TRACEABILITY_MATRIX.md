# Requirements Traceability Matrix (RTM)
## SwasthyaCare (स्वास्थ्य केयर) — End-to-End Requirements-to-Test Traceability

---

**Document ID:** SC-RTM-2026-V2.0  
**Parent Specification:** `Docs/02-Requirements/SRS.md` (Version 2.0.0)  
**Status:** 100% Verified (114+ Integration & Unit Tests Passed)  
**Last Updated:** November 17, 2026  

---

This matrix maps every functional requirement (FR) from `SRS.md` to its origin sprint, primary actor, and corresponding automated verification test suite.

| Requirement ID Range | Module Description | Primary Actor | Sprint | Automated Verification Suite | Result |
|:---:|---|:---:|:---:|---|:---:|
| **FR-AUTH-001** to **FR-AUTH-008** | Authentication, Bcrypt (10 rounds), Dual-Key JWT, RBAC, 1-Click Ribbon | All Roles | Sprint 2, 7 | `server/tests/sprint2.test.js` | ✅ 15/15 Passed |
| **FR-DOC-001** to **FR-DOC-006** | Doctor Directory, Specialty Search, Availability Slots | Doctor, Patient | Sprint 3 | `server/tests/sprint3.test.js` | ✅ 17/17 Passed |
| **FR-APT-001** to **FR-APT-010** | CAS Concurrency Engine, Double-Booking Conflict (409), Lifecycle State Machine | Patient, Doctor | Sprint 4, 8 | `server/tests/sprint4.test.js`<br>`server/tests/sprint8.test.js` | ✅ 36/36 Passed |
| **FR-FUP-001** to **FR-FUP-009** | Follow-Up Plans, Daily Check-Ins, NEWS2 Deterioration, Clinical NLP Triage (ML-REC-01) | Clinician, Patient | Sprint 5, ML-S5 | `server/tests/sprint5.test.js`<br>`server/tests/recovery_ml_sprint5.test.js` | ✅ 24/24 Passed |
| **FR-NOTIF-001** to **FR-NOTIF-005** | Idempotent Reminder Queue, Compound Deduplication Keys, Background Worker | System / Worker | Sprint 5, 8 | `server/tests/sprint5.test.js`<br>`server/tests/sprint8.test.js` | ✅ 12/12 Passed |
| **FR-CDS-001** to **FR-CDS-007** | Framingham 10-Yr ASCVD, FINDRISC Diabetes Score, Pydantic Bounds, SaMD Notices | Patient, Clinician | Sprint 6 | `server/tests/sprint6.test.js`<br>`ai-service/tests/test_ai_service.py` | ✅ 15/15 Passed |
| **FR-ML-001** to **FR-ML-009** | ML-CVD-01 (Cleveland), ML-DIA-01 (BRFSS), Gated Future Tasks, Review Audit Trail | Patient, Clinician | Sprint 6, 7, 8 | `server/tests/ml_assessments_sprint6.test.js`<br>`server/tests/ml_assessments_sprint7.test.js`<br>`server/tests/ml_release_gate_sprint8.test.js` | ✅ 30/30 Passed |
| **FR-OCR-001** to **FR-OCR-007** | Medicine Packaging Upload, Preprocessing, OCR Tokenizer, Formulary Matcher | Patient | Sprint 6 | `server/tests/sprint6.test.js`<br>`ai-service/tests/test_sprint6_inference_endpoints.py` | ✅ 14/14 Passed |
| **FR-DASH-001** to **FR-DASH-006** | Role Dashboards (Patient, Doctor, Admin, Management HIPAA Aggregate Barrier) | All Roles | Sprint 7 | `server/tests/sprint7.test.js`<br>`server/tests/phase7_multi_role_integration.test.js` | ✅ 35/35 Passed |
| **FR-CHAT-001** to **FR-CHAT-016** | Conversational AI, Dual-RAG, NegEx, P0 Emergency Intercept, 2-Step Actions, TTL | Patient, Clinician | Sprint 9–12 | `server/tests/chat_sprint11.test.js`<br>`server/tests/chat_rate_limit.test.js`<br>`server/tests/chatbot_release_gate_sprint12.test.js` | ✅ 28/28 Passed |
| **FR-VOICE-001** to **FR-VOICE-006** | Web Speech STT, Neural TTS (Sarvam AI Bulbul V3 / OpenAI Nova), Bilingual Mode | Patient | S11–S12, Post-S12 | `server/tests/chat_schema_validation.test.js`<br>`ai-service/tests/test_phase4_orchestration_providers.py` | ✅ Passed |
| **NFR-SEC-001** to **NFR-SEC-006** | JWT Security, IDOR Defense, Mongo Sanitize, Rate Limiting, Helmet Headers | System / DevOps | Sprint 2, 8, 12 | `server/tests/sprint8.test.js`<br>`server/tests/chat_rate_limit.test.js` | ✅ Passed |
| **NFR-PERF-001** to **NFR-PERF-004**| Atomic CAS Concurrency, Sub-150ms Latency, 10s AI Deadlines, Notification Idempotency| System / DevOps | Sprint 4, 8 | `server/tests/sprint8.test.js` | ✅ Passed |
| **NFR-PRV-001** to **NFR-PRV-004**| HIPAA Management De-Identification, Audit Logging, DISHA 1-Yr Retention, SaMD Notices | Management, Admin | Sprint 7, 11 | `server/tests/sprint7.test.js`<br>`server/tests/chat_sprint11.test.js` | ✅ Passed |

---

## Change Control & Baseline Maintenance
Any proposed change or extension to the functional requirements must adhere to the following 5-step gating protocol:
1. Update requirement definition in `SRS.md` with explicit clinical and security boundaries.
2. Update the corresponding module summary in `FUNCTIONAL_REQUIREMENTS.md`.
3. Add a dedicated automated test case ensuring regression coverage in `server/tests/` or `ai-service/tests/`.
4. Update this matrix (`TRACEABILITY_MATRIX.md`).
5. Execute `npm run test:all` in `server/` and `pytest tests/` in `ai-service/` to verify zero regression breaks.
