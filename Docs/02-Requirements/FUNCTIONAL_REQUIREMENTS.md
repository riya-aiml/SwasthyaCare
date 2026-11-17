# Functional Requirements Catalogue
## SwasthyaCare (स्वास्थ्य केयर) — Complete Module & Requirement Inventory

---

**Document ID:** SC-REQ-002  
**Parent Specification:** `Docs/02-Requirements/SRS.md` (Version 2.0.0)  
**Status:** Approved Baseline  
**Last Updated:** November 17, 2026  

---

The authoritative functional and non-functional requirement specifications are detailed in `SRS.md` (Version 2.0.0). This document serves as the high-level catalogue and checklist across all 11 core modules implemented throughout the project lifecycle.

## 1. Module Catalogue & ID Range Mapping

| Module No. | Module Name | Requirement ID Range | Primary Actors | Sprint Origin | Key Capabilities |
|:---:|---|---|---|:---:|---|
| **01** | **Authentication, Identity & RBAC** | `FR-AUTH-001` – `FR-AUTH-008` | All Roles | Sprint 2, 7 | Bcrypt hashing (10 rounds), Dual-key JWT (`authToken`/`token`), 4 roles, 1-Click Persona Ribbon, profile updates. |
| **02** | **Doctor Directory & Schedule Management** | `FR-DOC-001` – `FR-DOC-006` | Doctor, Patient | Sprint 3 | Clinical specialty filters, doctor profile self-management, bookable availability slots, schedule pruning. |
| **03** | **Concurrency-Controlled Appointment Lifecycle** | `FR-APT-001` – `FR-APT-010` | Patient, Doctor | Sprint 4, 8 | Atomic Compare-And-Swap (CAS) slot locking, double-booking race condition prevention (409 Conflict), state machine (`PENDING` $\to$ `CONFIRMED` / `REJECTED` / `CANCELLED`), doctor triage queue. |
| **04** | **Post-Discharge Follow-Up & Deterioration Triage** | `FR-FUP-001` – `FR-FUP-009` | Clinician, Patient | Sprint 5, ML-S5 | Care plans with medications, daily recovery check-ins, NEWS2 vitals deterioration scoring (ML-REC-01), clinical NLP symptom extraction (infection, DVT, dyspnea, sepsis rigors), longitudinal vitals delta tracking, clinician review. |
| **05** | **Idempotent Multi-Channel Reminder Queue** | `FR-NOTIF-001` – `FR-NOTIF-005` | System / Background Worker | Sprint 5, 8 | Scheduled SMS/Email reminders, compound deduplication keys (`plan_id_day_channel` & `appt_id_status_recipient`), unique index constraints, delivery telemetry. |
| **06** | **Statistical Clinical Decision Support (CDS)** | `FR-CDS-001` – `FR-CDS-007` | Patient, Clinician | Sprint 6 | Framingham 10-Year ASCVD Cox proportional hazards calculator, FINDRISC 10-Year Type-2 Diabetes calculator, Pydantic biological bound validation, SaMD clinical safety disclaimers. |
| **07** | **Machine Learning Diagnostic Classifiers** | `FR-ML-001` – `FR-ML-009` | Patient, Clinician | Sprint 6, 7, 8 | ML-CVD-01 (Cleveland 13 biomarkers, Logistic Regression / StandardScaler), ML-DIA-01 (CDC BRFSS 21 survey features, demographic fairness audited), longitudinal future-risk gating (ML-CVD-02, ML-DIA-02), assessment persistence and clinician review audit trail (`/api/assessments/:id/review`). |
| **08** | **Medicine Packaging OCR & Formulary Matching** | `FR-OCR-001` – `FR-OCR-007` | Patient | Sprint 6 | Multi-format packaging image upload, noise filtering, Tesseract OCR tokenization, Levenshtein distance candidate matching against approved pharmaceutical formulary, confidence scoring, non-prescription warnings. |
| **09** | **Role-Specific Dashboards & HIPAA Telemetry** | `FR-DASH-001` – `FR-DASH-006` | All Roles | Sprint 7 | Dedicated consoles for Patient, Doctor, Admin, and Management. Hospital Management console enforces strict HIPAA Privacy Rule §164.514 de-identification barrier (server-side `$group` and `$avg` aggregations, zero PII/PHI exposure). |
| **10** | **Hybrid Conversational AI Health Assistant** | `FR-CHAT-001` – `FR-CHAT-016` | Patient, Clinician | Sprint 9–12 | Dual-Corpus RAG (Platform guides + ICMR/WHO clinical evidence), Hybrid retrieval (BM25 + TF-IDF/LSA semantic vectors + Vernacular Hindi/Hinglish entity normalizer), Priority-0 hard red-flag emergency intercept (112, 108, Tele-MANAS), NegEx negation handling, in-text citation badging, strict anti-prescription defense, 2-step interactive action requisitions, 1-year retention TTL, tenant IDOR isolation. |
| **11** | **Neural Voice Assistant & Multilingual Capability** | `FR-VOICE-001` – `FR-VOICE-006` | Patient | S11–S12, Post-S12 | Web Speech STT, authentic neural speech synthesis (Sarvam AI Bulbul V3 Indian language voices, OpenAI TTS-1 Nova, browser Web Speech fallback), bilingual English and Hindi natural language processing. |

---

## 2. Requirement Quality & Verification Checklist
For every requirement in the catalogue, verification enforces:
1. **Unambiguous & Testable:** Formulated with deterministic acceptance criteria.
2. **Atomic Verification:** Linked to dedicated automated tests across Node.js (`server/tests/`) or Python Pytest (`ai-service/tests/`).
3. **Clinical Safety & Governance:** SaMD boundaries, emergency escalation triggers, and regulatory disclaimers verified before release gate sign-off.
4. **Data Isolation:** Verified against Insecure Direct Object Reference (IDOR) attacks across all user roles.
