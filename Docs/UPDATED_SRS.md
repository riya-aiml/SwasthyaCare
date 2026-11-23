# Software Requirements Specification (SRS)
## SwasthyaCare (स्वास्थ्य केयर) — Enterprise Clinical Management, Post-Discharge Triage & Decision Intelligence Platform

---

**Document ID:** SC-SRS-2026-V2.5-UPDATED  
**Document Title:** Software Requirements Specification (SRS) — Production Baseline  
**Version:** 2.5.0 (Comprehensive Release Baseline)  
**Status:** Approved & Verified Production Specification  
**Date of Release:** November 23, 2026  
**Supercedes:** SC-SRS-2026-V2.0 & SC-REQ-001 (Draft v0.1)  
**Classification:** Institutional HealthTech / Clinical Decision Support (CDS) & SaMD Prototype  
**Standards Conformance:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018, HIPAA Privacy Rule (45 CFR §164.514), DISHA Health Privacy Framework  

---

## Executive Summary

**SwasthyaCare (स्वास्थ्य केयर)** is an institutional-grade, multi-tier healthcare intelligence platform engineered to eliminate critical continuity-of-care bottlenecks in modern clinical workflows. The platform addresses the dual challenges of outpatient operational congestion and post-discharge adverse events through:
1. **High-Concurrency Appointment Scheduling:** An atomic Compare-And-Swap (CAS) locking mechanism eliminating double-booking collisions under peak booking traffic.
2. **Post-Discharge Recovery & Deterioration Triage:** Longitudinal recovery monitoring, National Early Warning Score 2 (NEWS2) clinical deterioration scoring, clinical NLP symptom extraction, and an idempotent multi-channel notification queue (SMS/Email).
3. **Statistical & Machine Learning Clinical Decision Support (CDS):** Peer-reviewed Framingham 10-Year ASCVD risk scoring, FINDRISC 10-Year Diabetes Mellitus scoring, ML diagnostic pattern classifiers (UCI Cleveland Heart Disease and CDC BRFSS Diabetes), and medicine packaging OCR candidate matching under strict SaMD safety guardrails.
4. **Role-Based Access Control (RBAC) & HIPAA-Compliant Telemetry:** Granular operational consoles for Patients, Doctors, Platform Administrators, and Hospital Management (C-Suite), featuring a strict HIPAA de-identification barrier (zero PII exposure).
5. **Hybrid Conversational AI & Neural Voice Agent:** A floating, bilingual (Hindi/English) clinical assistant featuring Dual-Corpus RAG (Platform + ICMR/WHO Guidelines), hybrid BM25 + LSA retrieval, Priority-0 emergency triage intercepts (112, 108, Tele-MANAS), clinical NegEx negation parsing, two-step interactive consequential action confirmations, and neural voice synthesis (Sarvam AI Bulbul V3 / OpenAI TTS-1 Nova).

The platform is backed by **114 automated regression and integration test scenarios** with a **100% pass rate** across all authorization boundaries, race conditions, physiological boundary validations, and notification pipelines.

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Scope of the System
   - 1.3 Regulatory & Clinical Device Boundaries (SaMD Notice)
   - 1.4 Document Conventions & Requirement Taxonomy
   - 1.5 Intended Audience
   - 1.6 Applicable Standards & Clinical References
2. [Overall System Description](#2-overall-system-description)
   - 2.1 Product Perspective & Distributed Topology
   - 2.2 User Classes & Persona Taxonomy
   - 2.3 Operating Environment & Technical Stack
   - 2.4 Design & Implementation Constraints
   - 2.5 Assumptions & Dependencies
3. [Specific Functional Requirements](#3-specific-functional-requirements)
   - 3.1 Module 1: Authentication, Identity & Role-Based Access Control (RBAC)
   - 3.2 Module 2: Doctor Directory, Specialty Filtering & Schedule Management
   - 3.3 Module 3: Concurrency-Controlled Appointment Lifecycle (Atomic CAS)
   - 3.4 Module 4: Post-Discharge Follow-Up, Recovery Triage & NEWS2 Deterioration
   - 3.5 Module 5: Idempotent Multi-Channel Notification Queue
   - 3.6 Module 6: Statistical Clinical Decision Support (ASCVD & FINDRISC)
   - 3.7 Module 7: Machine Learning Diagnostic Pattern Assessment (ML Workstream)
   - 3.8 Module 8: Medicine Packaging OCR & Formulary Matching
   - 3.9 Module 9: Role-Specific Dashboards & HIPAA Management Telemetry
   - 3.10 Module 10: Hybrid Conversational AI Health Assistant (Chatbot Workstream)
   - 3.11 Module 11: Neural Voice Assistant & Multilingual Capability
4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 User Interfaces (UI/UX Design System)
   - 4.2 Software & Inter-Service RPC Interfaces
   - 4.3 Database Interfaces & Data Models
   - 4.4 Communications Interfaces & Network Security
5. [Non-Functional Requirements (NFRs)](#5-non-functional-requirements-nfrs)
   - 5.1 Security Requirements
   - 5.2 Privacy & Regulatory Compliance (HIPAA & DISHA)
   - 5.3 Concurrency, Data Integrity & Performance
   - 5.4 Reliability, Availability & Fault Tolerance
   - 5.5 Usability, Localization & Accessibility
   - 5.6 Maintainability, DevOps & Cloud Deployment
6. [Requirements Traceability Matrix (RTM)](#6-requirements-traceability-matrix-rtm)
7. [Verification, Validation & Acceptance Criteria](#7-verification-validation--acceptance-criteria)
   - 7.1 Automated Full-System Regression Gate
   - 7.2 Clinical Safety & Ethics Sign-Off Criteria
8. [Appendix: Glossary & Technical Acronyms](#8-appendix-glossary--technical-acronyms)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional, external interface, performance, and non-functional requirements for **SwasthyaCare (स्वास्थ्य केयर)**. 

This document serves as the authoritative baseline and contract for software engineers, clinical informatics auditors, QA validation teams, and academic evaluators. It synthesizes all architectural specifications and engineering milestones delivered across Sprints 1 through 12, covering Core Platform Engineering, Clinical ML Workstreams, and Conversational Voice AI.

### 1.2 Scope of the System
SwasthyaCare is designed to resolve structural operational bottlenecks and clinical continuity gaps in modern hospital systems. The system encompasses eleven (11) core functional modules:
1. **Identity & Role-Based Access Control (RBAC):** Multi-role access for Patients, Clinicians (Doctors), Platform Administrators, and Hospital Management (C-Suite) with dual-key token resilience.
2. **Clinical Appointment Lifecycle Management:** High-concurrency appointment scheduling powered by an atomic Compare-And-Swap (CAS) locking engine that eliminates double-booking race conditions.
3. **Post-Discharge Recovery & Deterioration Monitoring:** Longitudinal care plan orchestration, daily recovery check-ins, National Early Warning Score 2 (NEWS2) vitals scoring, clinical NLP symptom extraction, and trajectory tracking.
4. **Idempotent Multi-Channel Notification Queue:** Background reminder dispatch (SMS/Email) enforcing compound deduplication keys to eliminate duplicate transmissions.
5. **Statistical Clinical Decision Support (CDS):** Peer-reviewed Framingham 10-Year ASCVD risk calculator and FINDRISC 10-Year Type-2 Diabetes Mellitus risk calculator.
6. **Machine Learning Diagnostic Pattern Assessment:** Supervised classification pipelines for Cardiovascular Stenosis (ML-CVD-01, UCI Cleveland 13 biomarkers) and Diabetes Indicator Classification (ML-DIA-01, CDC BRFSS 21 survey features), accompanied by clinician review audit workflows.
7. **Medicine Packaging OCR & Candidate Matcher:** Computer vision text tokenization and Levenshtein distance candidate matching against an institutional pharmaceutical formulary.
8. **Role-Specific Dashboards & HIPAA Analytics:** Tailored operational consoles, including a privacy-preserving management analytics dashboard that enforces a strict HIPAA de-identification barrier (zero PII exposure).
9. **Hybrid Conversational AI Health Assistant:** Dual-RAG retrieval over Platform and Clinical (ICMR/WHO) knowledge corpora, priority-0 emergency triage intercepts (112, 108, Tele-MANAS), NegEx negation detection, and two-step interactive consequential action confirmations.
10. **Neural Voice Synthesis & Multilingual Processing:** Web Speech API STT input, neural TTS audio streaming (Sarvam AI Bulbul V3 / OpenAI TTS-1 Nova), and bilingual English/Hindi interface.
11. **Resilient Cloud Gateway & Multi-Cloud Deployment:** Production routing between Vercel frontend, Render backend gateway, Render FastAPI AI microservice, and MongoDB Atlas.

### 1.3 Regulatory & Clinical Device Boundaries (SaMD Notice)
> **CRITICAL REGULATORY NOTICE (Software as a Medical Device - SaMD):**  
> SwasthyaCare is an academic demonstration and clinical decision-support prototype. The incorporated risk calculators, machine learning pipelines, OCR packaging matcher, and conversational voice assistant are **statistical decision-support instruments**. They:
> - **DO NOT** constitute FDA-certified or CDSCO-certified Class II/III Medical Devices.
> - **MUST NOT** be utilized as an autonomous diagnostic instrument.
> - **MUST NOT** directly prescribe, adjust, or discontinue pharmacological regimens.
> - Mandate clear advisory disclaimers and explicit clinician-in-the-loop oversight across all user interfaces.

### 1.4 Document Conventions & Requirement Taxonomy
- **Requirement Identifiers:** Every functional requirement is assigned a unique alphanumeric code:
  - `FR-AUTH-xxx`: Authentication, Identity & RBAC
  - `FR-DOC-xxx`: Doctor Directory & Scheduling
  - `FR-APT-xxx`: Concurrency-Controlled Appointments
  - `FR-FUP-xxx`: Post-Discharge Follow-Up & Deterioration Triage
  - `FR-NOTIF-xxx`: Idempotent Reminder Queue
  - `FR-CDS-xxx`: Statistical Clinical Risk Calculators
  - `FR-ML-xxx`: Machine Learning Diagnostic Classifiers
  - `FR-OCR-xxx`: Packaging OCR & Formulary Matching
  - `FR-DASH-xxx`: Role Dashboards & HIPAA Telemetry
  - `FR-CHAT-xxx`: Conversational AI & Dual-RAG Engine
  - `FR-VOICE-xxx`: Neural Speech & Multilingual Processing
  - `NFR-SEC-xxx`: Security Requirements
  - `NFR-PRV-xxx`: Privacy & Regulatory Compliance
  - `NFR-PERF-xxx`: Concurrency, Data Integrity & Performance
  - `NFR-REL-xxx`: Reliability, Availability & Fault Tolerance
  - `NFR-USE-xxx`: Usability, Localization & Accessibility
  - `NFR-OPS-xxx`: DevOps, Maintainability & Cloud Operations
- **Modal Verbs:**
  - **Shall:** Mandatory requirement for compliance and release acceptance.
  - **Should:** Highly recommended architectural best practice.
  - **May:** Optional or configurable feature.

### 1.5 Intended Audience
- **Software Engineers & DevOps:** System topology, data contracts, API routes, and concurrency boundaries.
- **Clinical Informatics Auditors:** SaMD guardrails, emergency intercept triggers, and reference corpora provenance.
- **Quality Assurance & Verification Teams:** Traceability matrix, automated test suites (Sprints 1–12), and acceptance criteria.
- **Academic & Regulatory Reviewers:** Ethical AI governance, demographic fairness monitoring, and HIPAA/DISHA compliance mechanisms.

### 1.6 Applicable Standards & Clinical References
- **ISO/IEC/IEEE 29148:2018:** Systems and software engineering — Life cycle processes — Requirements engineering.
- **IEEE Std 830-1998:** Recommended Practice for Software Requirements Specifications.
- **HIPAA Privacy & Security Rules (45 CFR Part 160 and Part 164):** Protected Health Information (PHI) safeguards and de-identification standards (§164.514).
- **DISHA (Digital Information Security in Healthcare Act):** Indian statutory health data privacy framework.
- **National Early Warning Score 2 (NEWS2):** Royal College of Physicians UK clinical deterioration scoring.
- **Clinical Practice Guidelines:** Indian Council of Medical Research (ICMR) Guidelines for Diabetes & Hypertension; World Health Organization (WHO) CVD Risk Charts; National Institute of Mental Health and Neurosciences (NIMHANS) Tele-MANAS protocols.

---

## 2. Overall System Description

### 2.1 Product Perspective & Distributed Topology
SwasthyaCare operates as a polyglot, multi-tier distributed microservices system designed for containerized deployment (Docker Compose) and hybrid cloud hosting (Vercel, Render, MongoDB Atlas).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT WORKSTATION / BROWSER                          │
│                   React 18.3 SPA + Vite 5 + Tailwind CSS 3.4                     │
│    - 1-Click Persona Ribbon (Patient, Doctor, Management, Admin)                 │
│    - Role Dashboards, CAS Appointment Booking, Follow-Up Care Plans              │
│    - ML Assessment Consoles, OCR Packaging Scanner, AI Floating Voice Assistant   │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTPS / TLS 1.3 / JSON
                                         │ Bearer JWT (Dual-Key Storage)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         NODE.JS / EXPRESS DOMAIN GATEWAY                         │
│                           Port 3001 (Render Web Service)                         │
│  ├── Security Middleware: Helmet, CORS, Express-Rate-Limit, Mongo-Sanitize       │
│  ├── Authentication & RBAC Guard: Dual-Key JWT Decoder (`authToken` & `token`)   │
│  ├── Modules: Auth, Users, Doctors, Appointments, FollowUps, Dashboards, Chat    │
│  ├── CAS Concurrency Engine: Atomic `findOneAndUpdate` Slot Locking             │
│  ├── Idempotent Background Notification Queue (Compound Deduplication Keys)       │
│  └── Cloud Proxy: Extended Timeout (10s), Custom User-Agent & Auth Headers       │
└──┬────────────────────────────────────────────────────────────────────────────┬──┘
   │ Mongoose ODM                                 Internal HTTP RPC (Zero-Trust)│
   │ (Port 27017)                                 Header: X-Internal-Service-Key │
   │                                              Timeout: 10,000ms              │
   ▼                                                                             ▼
┌─────────────────────────────────────────┐  ┌─────────────────────────────────────┐
│          MONGODB 8.0 REPLICA SET        │  │     FASTAPI AI & DECISION ENGINE    │
│          (MongoDB Atlas Cloud)          │  │     Port 8005 (Render AI Service)   │
│  ├── users, doctorprofiles              │  │  ├── Framingham ASCVD & FINDRISC    │
│  ├── availabilityslots (CAS State)      │  │  ├── ML-CVD-01 & ML-DIA-01 Models   │
│  ├── appointments, followupplans        │  │  ├── ML-REC-01 NEWS2 Recovery Engine│
│  ├── recoveryupdates, notificationjobs  │  │  ├── Tesseract OCR Tokenizer Matcher│
│  ├── riskassessments (Audit Trail)      │  │  ├── Dual-RAG Hybrid Retrieval      │
│  └── chatsessions, chatmessages         │  │  └── Guardrails: NegEx & P0 Intercept│
└─────────────────────────────────────────┘  └─────────────────────────────────────┘
```

### 2.2 User Classes & Persona Taxonomy
The system provides strictly isolated, tailored user interfaces for four distinct hospital personas:

| User Class | System Role Identifier | Description & Primary Capabilities |
|---|---|---|
| **Patient** | `patient` | Individual receiving care. Can search clinicians, book appointment slots via atomic CAS, submit post-discharge recovery updates, calculate CVD/diabetes risk scores, scan medicine packaging, and converse with the bilingual AI voice assistant. |
| **Doctor (Clinician)** | `doctor` | Credentialed healthcare provider. Can configure recurring availability slots, approve/decline appointment requests in a live triage queue, issue post-discharge follow-up care plans, monitor patient recovery trajectories, receive automated clinical NLP deterioration alerts, and review risk assessments. |
| **Hospital Management** | `hospital_management` | C-Suite executives and medical superintendents. Accesses real-time hospital operational throughput, bed occupancy metrics, clinic-by-clinic patient volumes, and reminder delivery reliability telemetry under a **strict HIPAA de-identification barrier (zero PII exposure)**. |
| **Platform Administrator** | `admin` | Systems and compliance officer. Manages user role assignments, verifies doctor medical credentials, monitors background notification queues, inspects system health probes, and manages account deactivations. |

### 2.3 Operating Environment & Technical Stack
- **Client Frontend:** Modern web browsers (Google Chrome 110+, Mozilla Firefox 115+, Apple Safari 16+, Microsoft Edge 110+). Minimum responsive viewport: 360px (mobile) to 2560px (ultra-wide desktop).
- **Backend Runtime:** Node.js v18.0.0+ / v20.x LTS, Express v4.18.2.
- **AI Microservice Runtime:** Python 3.11+ with FastAPI, Pydantic v2, scikit-learn v1.4, pandas v2.2, numpy v1.26.
- **Database Engine:** MongoDB Community Server v7.0+ or MongoDB Atlas Replica Set v8.0+.
- **Container Infrastructure:** Docker Engine 24.0+ and Docker Compose v2.20+.
- **Cloud Infrastructure:** Vercel (Client SPA), Render (Express Gateway & FastAPI AI Service), MongoDB Atlas (Database).

### 2.4 Design & Implementation Constraints
- **Zero Client-to-AI Direct Ingress:** The React frontend shall never communicate directly with the Python AI microservice. All requests must route through the Express Gateway to enforce JWT authentication, rate limiting, and IDOR isolation.
- **Atomic Compare-And-Swap (CAS):** Booking operations must not rely on two-step application-level checks (e.g., `find` followed by `save`). All slot state transitions must execute as a single atomic database query.
- **HIPAA De-Identification Enforcement:** Management dashboards must perform data aggregation exclusively on the database server using MongoDB `$group` and `$avg` aggregation pipelines. Raw patient documents containing PII/PHI must never be transferred into the application memory of management sessions.
- **Deterministic AI Fallbacks:** All statistical and ML services must feature local rule-based deterministic fallbacks (e.g., local NEWS2 scoring, rule-based NLP triage, and mock clinical grounding) ensuring platform stability during upstream LLM or external service outages.

### 2.5 Assumptions & Dependencies
- The host environment provides network connectivity between the Express Gateway and MongoDB instance.
- For neural voice features, the system assumes client browser support for Web Speech API and Web Audio API. External neural voice APIs (Sarvam AI / OpenAI) require valid API credentials; if omitted, the system falls back to standard browser speech synthesis.

---

## 3. Specific Functional Requirements

### 3.1 Module 1: Authentication, Identity & Role-Based Access Control (RBAC)

- **FR-AUTH-001 [User Registration & Validation]:** The system shall allow new users to register (`POST /api/auth/register`) with their full name, email address, password, phone number, and selected role (`patient` or `doctor`). The backend shall validate inputs using `express-validator`:
  - Full Name: String, 2 to 50 characters.
  - Email: Valid RFC 5322 format, converted to lowercase, trimmed, and checked for uniqueness in MongoDB.
  - Password: Minimum 6 characters (recommended 8+ with alphanumeric complexity).
  - Phone Number: Valid 10-digit telephone format.
  - Role: Restricted to `patient` or `doctor` during self-registration; administrative roles (`admin`, `hospital_management`) shall only be assigned by existing platform administrators.
- **FR-AUTH-002 [Password Hashing]:** The system shall hash all user passwords prior to persistence using `bcryptjs` with an algorithmic salt work factor of at least 10 rounds. Cleartext passwords shall never be persisted or logged.
- **FR-AUTH-003 [JWT Generation & Dual-Key Compatibility]:** Upon successful credential verification (`POST /api/auth/login`), the system shall issue a signed JSON Web Token (JWT) containing `id` and `role` claims with a configurable 7-day expiration (`JWT_EXPIRE=7d`). The client shall support dual-key local storage persistence (`authToken` and legacy `token`) to ensure session continuity across version upgrades.
- **FR-AUTH-004 [Route Authorization Guard]:** The system shall enforce role-based route middleware (`authenticate` and `requireRole`) across all private endpoints. Requests lacking a valid Bearer token shall be rejected with HTTP 401 Unauthorized; requests with insufficient role privileges shall be rejected with HTTP 403 Forbidden.
- **FR-AUTH-005 [User Profile Retrieval & Update]:** Authenticated users shall be able to fetch (`GET /api/auth/me`) and update (`PUT /api/users/:id`) their own profile data. IDOR protection shall guarantee that non-admin users cannot mutate profiles belonging to other tenants.
- **FR-AUTH-006 [Admin User Management]:** Platform administrators shall be permitted to query all registered user accounts (`GET /api/users`), deactivate compromised accounts (`DELETE /api/users/:id`), and verify doctor credentials.
- **FR-AUTH-007 [1-Click Persona Ribbon]:** For evaluation and demonstration purposes, the system frontend shall provide an interactive persona ribbon enabling instantaneous token swapping between predefined test accounts (Patient, Doctor, Management, Admin) without requiring manual re-login.
- **FR-AUTH-008 [Session Logout]:** The system shall provide an endpoint (`POST /api/auth/logout`) that clears authentication headers and flushes client-side token storage.

### 3.2 Module 2: Doctor Directory, Specialty Filtering & Schedule Management

- **FR-DOC-001 [Doctor Directory & Specialty Search]:** The system shall provide a public directory (`GET /api/doctors`) allowing users to filter clinicians by clinical specialty (Cardiology, Endocrinology, General Medicine, Orthopedics, Pediatrics, etc.), minimum years of experience, and location.
- **FR-DOC-002 [Doctor Profile Management]:** Credentialed doctors shall be able to view and update their professional profile (`GET /api/doctors/profile/me`, `PUT /api/doctors/profile/me`), including consultation fees, qualifications, bio, and hospital department affiliations.
- **FR-DOC-003 [Bookable Availability Slot Creation]:** Doctors shall be able to define discrete, non-overlapping availability time slots (`POST /api/doctors/availability`) by specifying date, start time, end time, and maximum patient capacity.
- **FR-DOC-004 [Slot Availability Retrieval]:** Patients and clinicians shall be able to retrieve bookable availability slots for any active doctor (`GET /api/doctors/:id/slots`), displaying only slots with an `available` status.
- **FR-DOC-005 [Slot Deletion & Pruning]:** Doctors shall be able to delete unreserved availability slots (`DELETE /api/doctors/availability/:slotId`). The system shall prevent the deletion of slots that are already bound to confirmed patient appointments.
- **FR-DOC-006 [Sample Directory Seeding]:** The system shall provide a seeding utility (`GET /api/doctors/seed`) to initialize verified test clinician profiles across major medical specialties.

### 3.3 Module 3: Concurrency-Controlled Appointment Lifecycle (Atomic CAS)

- **FR-APT-001 [Atomic Slot Reservation & Booking Request]:** The system shall permit authenticated patients to submit an appointment request (`POST /api/appointments/request`). The backend must atomically transition the requested slot from `available` to `reserved` using an atomic MongoDB `findOneAndUpdate` operation:
  ```javascript
  AvailabilitySlot.findOneAndUpdate(
    { _id: slotId, status: 'available' },
    { $set: { status: 'reserved' } },
    { new: true }
  )
  ```
- **FR-APT-002 [Double-Booking Race Condition Prevention]:** If two or more concurrent booking requests target the same availability slot, the atomic CAS operation shall ensure exactly one request succeeds. All competing requests must immediately fail and return HTTP 409 Conflict with the message: *"This appointment slot has already been booked by another patient."*
- **FR-APT-003 [Initial State Transition]:** Upon successful atomic slot reservation, the system shall create an appointment record with an initial status of `PENDING` and link it to the patient and assigned doctor.
- **FR-APT-004 [Doctor Triage Queue]:** Doctors shall be provided an authenticated endpoint (`GET /api/appointments/pending`) to inspect all pending consultation requests assigned to them, including patient symptoms and initial triage notes.
- **FR-APT-005 [Doctor Approval Workflow]:** Assigned doctors shall be able to approve a pending appointment (`PUT /api/appointments/:id/approve`). The system shall transition the appointment status to `CONFIRMED`, update the corresponding slot status to `booked`, and queue a confirmation notification for the patient.
- **FR-APT-006 [Doctor Rejection Workflow]:** Assigned doctors shall be able to reject a pending appointment (`PUT /api/appointments/:id/reject`) with an optional clinical rationale. The system shall transition the appointment status to `REJECTED`, release the availability slot back to `available`, and queue a rejection notification.
- **FR-APT-007 [Patient & Doctor Cancellation Workflow]:** Patients or assigned doctors shall be permitted to cancel an active appointment (`PUT /api/appointments/:id/cancel`). The system shall transition the appointment status to `CANCELLED`, release the slot back to `available`, and log the cancellation actor and timestamp.
- **FR-APT-008 [Appointment History Retrieval]:** Authenticated users shall be able to retrieve their personal appointment history (`GET /api/appointments/my-appointments`), sorted chronologically with status filtering (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`).
- **FR-APT-009 [Appointment Detail Access Control]:** Access to single appointment details (`GET /api/appointments/:id`) shall be strictly restricted to the patient who booked it, the assigned doctor, or a platform administrator.
- **FR-APT-010 [Audit Trail & Timestamping]:** All appointment lifecycle transitions shall record immutable metadata: `createdAt`, `updatedAt`, `statusHistory`, and the identity of the mutating user.

### 3.4 Module 4: Post-Discharge Follow-Up, Recovery Triage & NEWS2 Deterioration

- **FR-FUP-001 [Care Plan Creation]:** Attending clinicians shall be able to author structured post-discharge follow-up plans (`POST /api/follow-ups`) upon patient discharge. A care plan shall specify: primary diagnosis, surgical/discharge date, prescribed medication regimen (drug name, dosage, frequency, duration), recommended dietary/activity guidelines, follow-up duration (in days), and red-flag escalation thresholds.
- **FR-FUP-002 [Automated Check-In Schedule Generation]:** Upon creation of a follow-up plan, the system shall automatically generate daily check-in expectations across the recovery window (e.g., Days 1, 3, 7, 14, 30).
- **FR-FUP-003 [Patient Daily Recovery Update Submission]:** Discharged patients shall be able to submit daily recovery check-ins (`POST /api/follow-ups/:planId/recovery-updates`). The submission shall collect:
  - **Self-Reported Vitals:** Systolic Blood Pressure (mmHg), Diastolic Blood Pressure (mmHg), Heart Rate (bpm), Body Temperature (°F), Oxygen Saturation ($SpO_2$ in %), and Blood Glucose (mg/dL).
  - **Symptomatic Scale:** Numerical Pain Score (0–10 Wong-Baker scale).
  - **Medication Adherence:** Boolean confirmation of prescribed medication intake.
  - **Qualitative Recovery Narrative:** Free-text descriptions of wound status, physical mobility, and subjective well-being.
- **FR-FUP-004 [Clinical Deterioration Scoring Engine (ML-REC-01)]:** The system shall immediately evaluate every recovery check-in against the standardized National Early Warning Score 2 (NEWS2) protocol and physiological threshold boundaries:
  - Extreme hypoxemia ($SpO_2 < 92\%$) $\to$ Immediate Critical Alert.
  - Hyperpyrexia ($\text{Temperature} \ge 102.0^\circ\text{F}$) $\to$ High-Risk Febrile Warning.
  - Severe tachycardia ($\text{Heart Rate} > 120\text{ bpm}$) or severe hypertension ($\text{Systolic BP} > 160\text{ mmHg}$) $\to$ Elevated Cardiovascular Alert.
  - Severe intractable pain ($\text{Pain Score} \ge 8/10$) $\to$ Urgent Symptom Alert.
  - Medication non-adherence $\to$ Treatment Compliance Flag.
- **FR-FUP-005 [Clinical NLP Adverse Symptom Extraction]:** The recovery engine shall process free-text patient narratives using clinical regex-based NLP pattern matchers to detect high-risk complications:
  - *Surgical Site Infection / Cellulitis:* "pus", "oozing", "foul smell", "yellow discharge", "red streaks", "dehiscence".
  - *Respiratory / Thromboembolic Distress:* "can't breathe", "shortness of breath", "calf pain", "swollen ankle", "chest pressure".
  - *Systemic Sepsis & Neurological Warning:* "shivering violently", "rigors", "passed out", "blackout", "confused", "hallucination".
- **FR-FUP-006 [Triage Categorization]:** Check-in risk assessments shall be categorized into discrete triage tiers: `LOW`, `MODERATE`, or `CRITICAL`. Check-ins triggering critical thresholds shall immediately elevate the care plan status to `FLAGGED_ATTENTION`.
- **FR-FUP-007 [Longitudinal Trajectory Tracking]:** The system shall compare consecutive recovery submissions to compute longitudinal vitals deltas ($\Delta \text{BP}$, $\Delta \text{SpO}_2$, $\Delta \text{Pain}$), detecting sub-acute deterioration trends before acute physiological collapse occurs.
- **FR-FUP-008 [Clinician Review & Note Logging]:** Clinicians shall be provided an endpoint (`PUT /api/follow-ups/updates/:updateId/review`) to review flagged check-ins, record clinical observations, and mark alerts as acknowledged or resolved.
- **FR-FUP-009 [Patient & Clinician Plan Queries]:** Patients shall be able to view their active care plans (`GET /api/follow-ups/my-plans`), and clinicians shall be able to view all plans issued under their medical license (`GET /api/follow-ups/clinician/plans`).

### 3.5 Module 5: Idempotent Multi-Channel Notification Queue

- **FR-NOTIF-001 [Automated Job Generation]:** When a follow-up plan is created, the system shall pre-generate notification jobs in MongoDB across configured channels (SMS and Email) for scheduled check-in reminders.
- **FR-NOTIF-002 [Compound Deduplication Keys]:** To eliminate duplicate transmissions and notification spam, every notification job shall enforce an immutable, unique compound deduplication key:
  - For follow-up reminders: `deduplicationKey = followUpPlanId + "_" + scheduledDay + "_" + channel`
  - For appointment updates: `deduplicationKey = appointmentId + "_" + status + "_" + recipientId`
- **FR-NOTIF-003 [Unique Index Constraint]:** The MongoDB `notificationjobs` collection shall enforce a unique index on `deduplicationKey`. Any attempt to insert a duplicate job for the same event and channel shall be rejected with MongoDB error 11000.
- **FR-NOTIF-004 [Queue Processing Worker]:** The system shall provide an endpoint (`POST /api/follow-ups/reminders/process`) and scheduled background runner that claims `PENDING` jobs, simulates dispatch via external gateway adapters, records delivery status (`SENT` or `FAILED`), and updates attempt counters.
- **FR-NOTIF-005 [Delivery Observability]:** Platform administrators and hospital management shall be able to audit scheduled reminder jobs (`GET /api/follow-ups/reminders`), observing dispatch timestamps, error payloads, and channel reliability percentages.

### 3.6 Module 6: Statistical Clinical Decision Support: ASCVD & FINDRISC

- **FR-CDS-001 [Framingham 10-Year ASCVD Calculator]:** The Python AI microservice shall implement the published National Heart, Lung, and Blood Institute (NHLBI) Framingham Cox proportional hazards regression model (`POST /api/ai/predict/heart-risk`).
- **FR-CDS-002 [ASCVD Input Parameters & Pydantic Validation]:** The ASCVD endpoint shall validate input parameters against strict physiological bounds via Pydantic v2:
  - Age: 30 to 79 years
  - Biological Sex: `male` or `female`
  - Total Cholesterol: 100 to 405 mg/dL
  - HDL Cholesterol: 10 to 100 mg/dL
  - Systolic Blood Pressure: 90 to 200 mmHg
  - Antihypertensive Medication: Boolean
  - Current Cigarette Smoker: Boolean
  - Diabetes Diagnosis: Boolean
- **FR-CDS-003 [ASCVD Risk Stratification]:** The calculator shall compute the 10-year percentage probability of a coronary event and assign clinical risk categories:
  - `< 10%`: Low 10-Year ASCVD Risk
  - `10% – 20%`: Intermediate 10-Year ASCVD Risk
  - `> 20%`: High 10-Year ASCVD Risk
- **FR-CDS-004 [FINDRISC 10-Year Diabetes Risk Calculator]:** The AI microservice shall implement the validated Finnish Diabetes Risk Score (FINDRISC) algorithm (`POST /api/ai/predict/diabetes-risk`).
- **FR-CDS-005 [FINDRISC Input Parameters]:** The endpoint shall accept and score 8 evidence-based epidemiological factors: Age group, Body Mass Index (BMI in $\text{kg/m}^2$), Waist Circumference (cm), Daily Physical Activity (>30 min), Daily Vegetable/Fruit Consumption, History of Antihypertensive Medication, History of High Blood Glucose, and Family History of Diabetes (immediate vs second-degree relatives).
- **FR-CDS-006 [FINDRISC Risk Stratification]:** The calculator shall produce an aggregate integer score (0 to 26 points) and categorize prospective 10-year diabetes risk:
  - `< 7 points`: Low Risk (Estimated 1 in 100 develop disease)
  - `7–11 points`: Slightly Elevated Risk (Estimated 1 in 25)
  - `12–14 points`: Moderate Risk (Estimated 1 in 6)
  - `15–20 points`: High Risk (Estimated 1 in 3)
  - `> 20 points`: Very High Risk (Estimated 1 in 2)
- **FR-CDS-007 [Mandatory Clinical Disclaimers]:** All calculator responses shall return an immutable clinical safety disclaimer explicitly stating that the output is a statistical risk estimation instrument, does not constitute a definitive medical diagnosis, and requires professional clinician interpretation.

### 3.7 Module 7: Machine Learning Diagnostic Pattern Assessment (ML Workstream)

- **FR-ML-001 [Task ML-CVD-01: Cardiovascular Status Classification]:** The system shall provide an inference endpoint (`POST /api/ai/assessments/cardiovascular/current-status`) implementing a trained, calibrated classification pipeline on the UCI Cleveland Heart Disease benchmark (303 patient records).
- **FR-ML-002 [ML-CVD-01 Input Feature Vector]:** The endpoint shall accept 13 validated diagnostic biomarkers:
  - `age`: 20 to 100 years
  - `sex`: 0 (female) or 1 (male)
  - `cp`: Chest pain type (1: typical angina, 2: atypical angina, 3: non-anginal pain, 4: asymptomatic)
  - `trestbps`: Resting blood pressure (90–200 mmHg)
  - `chol`: Serum cholesterol (100–600 mg/dL)
  - `fbs`: Fasting blood sugar > 120 mg/dL (0: false, 1: true)
  - `restecg`: Resting ECG results (0: normal, 1: ST-T wave abnormality, 2: left ventricular hypertrophy)
  - `thalach`: Maximum exercise heart rate achieved (60–220 bpm)
  - `exang`: Exercise-induced angina (0: no, 1: yes)
  - `oldpeak`: ST depression induced by exercise relative to rest (0.0–6.2 mm)
  - `slope`: Slope of peak exercise ST segment (1: upsloping, 2: flat, 3: downsloping)
  - `ca`: Number of major vessels colored by fluoroscopy (0–3)
  - `thal`: Thallium scintigraphy (3: normal, 6: fixed defect, 7: reversible defect)
- **FR-ML-003 [ML-CVD-01 Model Architecture]:** The model pipeline shall incorporate a `StandardScaler` followed by an L2-regularized `LogisticRegression` classifier, calibrated via sigmoid probability scaling, achieving AUC-ROC $\ge 0.88$ on held-out test splits.
- **FR-ML-004 [Task ML-DIA-01: Diabetes Status Classification]:** The system shall provide an inference endpoint (`POST /api/ai/assessments/diabetes/current-status`) implementing a trained classification pipeline on the CDC Behavioral Risk Factor Surveillance System (BRFSS 2015, 253,680 survey records).
- **FR-ML-005 [ML-DIA-01 Input Feature Vector]:** The endpoint shall accept 21 standardized survey indicators spanning metabolic history (`HighBP`, `HighChol`, `CholCheck`), anthropometrics (`BMI`), behaviors (`Smoker`, `PhysActivity`, `Fruits`, `Veggies`, `HvyAlcoholConsump`), demographics (`Sex`, `Age`, `Education`, `Income`), and subjective health status (`GenHlth`, `PhysHlth`, `MentHlth`, `DiffWalk`).
- **FR-ML-006 [Fairness & Subgroup Monitoring]:** The ML-DIA-01 model shall maintain parity in false-positive and false-negative rates across biological sex and age demographic strata, verified against equal opportunity fairness criteria.
- **FR-ML-007 [Longitudinal Future-Onset Gating Protocol]:** Tasks `ML-CVD-02` (10-Year MACE incidence) and `ML-DIA-02` (5-Year incident diabetes onset) shall remain in an explicit **Deferred / Gated** status. The system shall not fabricate longitudinal predictions from cross-sectional datasets and shall present clear gating notices in the UI until longitudinal prospective cohort data is audited.
- **FR-ML-008 [Assessment Persistence & Audit Trail]:** All ML assessment executions shall be persisted in the MongoDB `riskassessments` collection (`POST /api/assessments/diabetes` and `/api/assessments/cardiovascular`), recording patient ID, task ID, model version, raw feature vectors, prediction label, probability, and execution timestamps.
- **FR-ML-009 [Clinician Assessment Review Workflow]:** Clinicians shall be able to inspect a patient's historical risk assessments (`GET /api/assessments/patient/:patientId`) and log formal clinical review notes (`POST /api/assessments/:id/review`), updating the assessment's status from `unreviewed` to `reviewed`.

### 3.8 Module 8: Medicine Packaging OCR & Formulary Matching

- **FR-OCR-001 [Packaging Image Upload]:** Authenticated patients and clinicians shall be able to upload images of medicine packaging, blister packs, or prescription labels (`POST /api/ai/ocr/medicine` or `POST /api/ai/ocr/upload-packaging`).
- **FR-OCR-002 [Image File Validation]:** The system shall validate uploaded image files, accepting JPEG, PNG, and WebP formats with a maximum file size of 10MB. Non-image or corrupted files shall be rejected with HTTP 422 Unprocessable Entity.
- **FR-OCR-003 [Image Preprocessing & OCR Pipeline]:** The AI microservice shall preprocess uploaded images (grayscale conversion, adaptive thresholding, bilateral noise filtering) and extract textual characters using optical character recognition (PyTesseract / Tesseract OCR).
- **FR-OCR-004 [Text Tokenization & Cleaning]:** The extracted text shall be tokenized, normalized to alphanumeric characters, and stripped of extraneous packaging symbols (e.g., batch numbers, barcode digits, expiry formatting).
- **FR-OCR-005 [Formulary Candidate Matching]:** The OCR service shall compare extracted tokens against an approved institutional pharmaceutical formulary (e.g., Metformin, Atorvastatin, Amlodipine, Paracetamol, Amoxicillin, Losartan) using Levenshtein distance ratio algorithms.
- **FR-OCR-006 [Confidence Scoring & Inconclusive Handling]:** The matching engine shall compute a normalized match confidence score (0.0 to 1.0). Matches with confidence $\ge 0.70$ shall return the candidate medicine name, active chemical salt, standard dosage forms, and manufacturer. Matches with confidence $< 0.70$ shall return an explicit `inconclusive` status.
- **FR-OCR-007 [Pharmacist Verification Warning]:** Every OCR response shall prominently display the advisory warning: *"Possible match based on packaging text. Always verify actual medicine with a licensed pharmacist or physician before consumption. Do not self-medicate."*

### 3.9 Module 9: Role-Specific Dashboards & HIPAA Management Telemetry

- **FR-DASH-001 [Patient Dashboard View]:** The system shall provide an integrated patient dashboard (`GET /api/dashboards/patient`) displaying: upcoming confirmed appointments, active post-discharge care plans, pending daily check-in tasks, past ML risk assessment summaries, and quick-action shortcuts for booking and OCR.
- **FR-DASH-002 [Doctor Clinical Dashboard View]:** The system shall provide a clinician dashboard (`GET /api/dashboards/doctor`) displaying: today's scheduled consultations, pending appointment requests queue, active post-discharge patients with automated NEWS2 deterioration flags, and recently submitted recovery updates.
- **FR-DASH-003 [Admin Operations Dashboard View]:** The system shall provide a platform administrator dashboard (`GET /api/dashboards/admin`) displaying: total registered users partitioned by role, pending doctor verification requests, system operational uptime, notification queue backlog, and database collection volumes.
- **FR-DASH-004 [Hospital Management C-Suite Analytics]:** The system shall provide an executive analytics dashboard (`GET /api/dashboards/management`) displaying institutional KPIs: clinic department utilization, average patient recovery check-in adherence rate, total consultations completed, and notification channel dispatch success rates.
- **FR-DASH-005 [Strict HIPAA De-Identification Barrier]:** To comply with HIPAA Privacy Rule §164.514, the management dashboard endpoint shall query population aggregations (`$group`, `$avg`, `$count`) exclusively. It shall **NEVER** project or serialize patient names, email addresses, phone numbers, individual medical notes, or check-in free text into management payloads.
- **FR-DASH-006 [Dashboard Role Authorization]:** Attempting to access a dashboard endpoint without the corresponding role privilege (e.g., a patient requesting `/api/dashboards/management`) shall immediately return HTTP 403 Forbidden.

### 3.10 Module 10: Hybrid Conversational AI Health Assistant (Chatbot Workstream)

- **FR-CHAT-001 [Conversational Chat Interface]:** The system shall provide an ergonomic, collapsible floating chat companion (`AIHealthAssistant.jsx`) accessible across all views of the application, featuring full Markdown rendering, citation badges, and voice synthesis controls.
- **FR-CHAT-002 [Multi-Turn Session Lifecycle]:** The system shall support authenticated, persistent multi-turn chat sessions (`POST /api/chat/sessions`, `GET /api/chat/sessions`, `GET /api/chat/sessions/:id`, `DELETE /api/chat/sessions/:id`).
- **FR-CHAT-003 [Tenant Data Isolation & IDOR Defense]:** The chat gateway shall enforce strict tenant isolation: every session query must verify `session.user.toString() === req.user._id.toString()`. Patients shall never view, query, or delete chat sessions belonging to other users.
- **FR-CHAT-004 [1-Year Data Retention TTL]:** Chat sessions and messages shall enforce a DISHA/HIPAA-aligned 1-year data retention policy (`retentionExpiresAt = Date.now() + 365 days`), configured with MongoDB TTL indexing for automated cleanup.
- **FR-CHAT-005 [Context-Bounded History]:** To maintain low latency and prevent token budget exhaustion, the orchestration engine shall bound conversational memory to the last 10 dialog turns (5 user/assistant pairs).
- **FR-CHAT-006 [Intent Taxonomy & Priority-Ordered Routing]:** The orchestrator shall classify every incoming user message into a prioritized intent hierarchy:
  1. `INTENT_EMERGENCY` (Priority 0 — Highest)
  2. `INTENT_APP_ACTION` (Priority 1)
  3. `INTENT_APP_NAVIGATION` (Priority 1)
  4. `INTENT_REPORT_EXPLANATION` (Priority 1)
  5. `INTENT_CLINICAL_QA` (Priority 2)
  6. `INTENT_GENERAL_CHITCHAT` (Priority 3)
- **FR-CHAT-007 [Priority-0 Hard Emergency Intercept]:** If the query expresses acute life-threatening symptoms (cardiac arrest, left arm radiating pain, severe dyspnea, acute stroke paralysis, or active suicidal ideation), the system shall bypass general LLM generation and immediately return an emergency crisis card directing the user to dial national emergency services:
  - Medical / Police / Fire: **112**
  - Emergency Ambulance: **108**
  - Tele-MANAS Mental Health Helpline: **14416** / **1800-891-4416**
- **FR-CHAT-008 [NegEx Negation Detection]:** The safety engine shall implement clinical NegEx negation parsing (e.g., analyzing pre- and post-negation windows for phrases such as *"no chest pain"*, *"denies shortness of breath"*). Negative symptom assertions shall not trigger false-positive emergency lockouts.
- **FR-CHAT-009 [Dual-Corpus RAG Architecture]:** The AI service shall maintain two strictly separated knowledge corpora:
  - **Platform Knowledge Corpus:** SwasthyaCare navigation guides, OPD token rules, appointment scheduling workflows, follow-up submission instructions.
  - **Clinical Guidelines Corpus:** Peer-reviewed clinical evidence sourced exclusively from the Indian Council of Medical Research (ICMR Guidelines on Diabetes & Hypertension), WHO CVD Risk Guidelines, and MoHFW National Health Portal.
- **FR-CHAT-010 [Hybrid Retrieval Engine]:** Information retrieval shall combine:
  - **BM25 Lexical Keyword Search:** Okapi BM25 scoring for exact medical and anatomical terminology.
  - **Dense Semantic Vector Search:** TF-IDF with TruncatedSVD Latent Semantic Analysis (LSA) for conceptual alignment.
  - **Vernacular Hindi/Hinglish Entity Normalizer:** Pre-retrieval translation mapping vernacular concepts (e.g., *"chhati me dard"* $\to$ chest pain, *"shakkar"* $\to$ blood sugar, *"dawa"* $\to$ medication) to standardized clinical terms.
- **FR-CHAT-011 [In-Text Citation Badging]:** All clinical and platform answers generated by the assistant shall include explicit in-text citation badges linked to the authoritative document ID (e.g., `[DOC-CLIN-01: ICMR Diabetes Management]` or `[DOC-PLAT-01: SwasthyaCare OPD Guide]`).
- **FR-CHAT-012 [Strict Anti-Prescription Defense]:** The assistant shall strictly reject requests to prescribe specific pharmaceuticals, calculate dosages, or approve prescription changes, returning the standardized refusal: *"I cannot prescribe medications or adjust dosages. Please consult your physician or pharmacist."*
- **FR-CHAT-013 [Two-Step Interactive Consequential Actions]:** When a user requests an appointment booking or cancellation through the chat assistant, the system **SHALL NOT** execute a unilateral database mutation. Instead, it shall return a structured `ActionProposal` card:
  - The card displays the requested doctor, date, time slot, and action type.
  - The mutation only executes when the user explicitly clicks the "Confirm Booking" button, dispatching a confirmed request (`POST /api/chat/messages/:id/confirm-action`).
  - The confirmation endpoint re-verifies slot availability and executes the atomic CAS lock.
- **FR-CHAT-014 [Patient Report Explanation]:** When a patient queries past risk assessment results, the assistant shall ingest the authorized assessment record (`req.user.id`), explain the statistical concepts in plain language, and reinforce that it is an estimate, not a clinical diagnosis.
- **FR-CHAT-015 [Multi-Provider LLM Adapter]:** The Python AI service shall support multiple swappable LLM provider backends via an abstract base adapter:
  - `AnthropicClaudeProvider`: Claude 3.5 Sonnet / 4.5
  - `OpenAIProvider`: GPT-4o / GPT-4o-mini
  - `DeterministicMockProvider`: Local deterministic fallback providing grounded citations and safety cards without external API dependencies.
- **FR-CHAT-016 [Rate Limiting]:** To prevent denial-of-service and LLM quota exhaustion, chat message endpoints shall be rate-limited via `express-rate-limit` (maximum 30 requests per 15-minute window per IP/user).

### 3.11 Module 11: Neural Voice Assistant & Multilingual Capability

- **FR-VOICE-001 [Speech-to-Text (STT) Voice Input]:** The chat assistant frontend shall provide a microphone toggle leveraging the browser Web Speech Recognition API (`SpeechRecognition` / `webkitSpeechRecognition`), transcribing spoken voice queries directly into the chat prompt.
- **FR-VOICE-002 [Neural Text-to-Speech (TTS) Streaming]:** The system shall support authentic, low-latency neural audio streaming for assistant responses, converting clean response text into natural human speech.
- **FR-VOICE-003 [Sarvam AI Bulbul V3 Integration]:** For authentic Indian English and regional vernacular pronunciation, the system shall support the Sarvam AI Bulbul V3 neural voice engine with configurable speakers (`meera`, `pavithra`, `arvind`).
- **FR-VOICE-004 [OpenAI Neural Speech Integration]:** The system shall provide an endpoint (`POST /api/chat/tts`) proxying to the OpenAI `tts-1` neural speech model, supporting natural conversational voices (`nova`, `shimmer`, `alloy`, `echo`).
- **FR-VOICE-005 [Browser SpeechSynthesis Fallback]:** In offline environments or when external TTS API keys are not supplied, the system shall seamlessly fall back to local browser `window.speechSynthesis`.
- **FR-VOICE-006 [Bilingual English & Hindi Mode]:** The chat and voice interface shall support an instant language toggle between English and Hindi, adapting prompt templates, system instructions, and audio synthesizer accents accordingly.

---

## 4. External Interface Requirements

### 4.1 User Interfaces (UI/UX Design System)
- **Framework & Libraries:** React 18.3, Vite 5, Tailwind CSS 3.4, Lucide React icons, Recharts 2.12.
- **Clinical Color Hierarchy:**
  - Red / Rose: Priority-0 emergency alerts, critical NEWS2 deterioration, severe risk tiers.
  - Amber / Orange: Moderate risk scores, pending clinician review, unconfirmed appointments.
  - Emerald / Teal: Approved appointments, normal physiological recovery, low risk scores.
  - Indigo / Blue: Informational citations, platform navigation, active care plans.
- **Viewport Adaptability:** Seamless responsive layout transitions from mobile viewports (360px) to ultra-wide desktop monitors (2560px) with zero horizontal overflow clipping.
- **Accessibility:** Compliance with WCAG 2.1 Level AA color contrast ratios ($\ge 4.5:1$). Interactive controls must support full keyboard navigation (Tab, Enter, Space, Escape).

### 4.2 Software & Inter-Service RPC Interfaces
- **Frontend-to-Backend Interface:** RESTful JSON over HTTPS. Authenticated via `Authorization: Bearer <JWT>`. Auto-routes to Vercel/Render production domains or local Vite proxy (`/api`).
- **Backend Gateway-to-AI Microservice Interface:** Internal HTTP RPC protected by mutual pre-shared secret header:
  - Header: `X-Internal-Service-Key: <INTERNAL_AI_SERVICE_SECRET>`
  - User-Agent: Custom non-empty identifier (`SwasthyaCare-Server/1.0`) to satisfy cloud proxy requirements.
  - Timeout: 10,000ms deadline with graceful degradation to local deterministic rule engines.
- **Database Interface:** Mongoose v8.0+ connecting to MongoDB Replica Set via authenticated URI with connection pooling and automated reconnects.
- **External AI Providers:**
  - Anthropic Messages API (`https://api.anthropic.com/v1/messages`)
  - OpenAI Audio Speech API (`https://api.openai.com/v1/audio/speech`)
  - Sarvam AI Speech API (`https://api.sarvam.ai/text-to-speech`)

### 4.3 Database Interfaces & Data Models
The MongoDB database houses ten primary collections:
1. `users`: Identity records, salted password hashes, user roles, phone numbers.
2. `doctorprofiles`: Department, qualifications, fees, experience, bio.
3. `availabilityslots`: Date, start/end time, status (`available`, `reserved`, `booked`), capacity.
4. `appointments`: Slot reference, patient, doctor, status (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`), reason, audit history.
5. `followupplans`: Patient, doctor, diagnosis, medication regimen, discharge date, scheduled days.
6. `recoveryupdates`: Daily vitals (BP, HR, temp, $SpO_2$, glucose), pain score, adherence, narrative, computed NEWS2 score, clinical triage tier, clinician review state.
7. `notificationjobs`: Channel (SMS/Email), scheduled time, status (`PENDING`, `SENT`, `FAILED`), compound `deduplicationKey`.
8. `riskassessments`: Task ID (`ML-CVD-01`, `ML-DIA-01`, `ASCVD`, `FINDRISC`), feature vector, score/probability, risk category, clinician review state and review notes.
9. `chatsessions`: User ID, title, active state, retention expiration (`retentionExpiresAt`).
10. `chatmessages`: Session ID, role (`user`, `assistant`), message text, citations, intent tag, action proposals.

### 4.4 Communications Interfaces & Network Security
- **Transport Layer Security:** All client-to-server and cloud inter-service channels must enforce TLS 1.3 encryption.
- **CORS Policies:** Configured in Express to restrict API ingress to designated frontend domains.
- **Payload Encoding:** UTF-8 encoded `application/json` for standard REST payloads, `multipart/form-data` for image packaging uploads, and `audio/mpeg` for neural TTS streaming.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Security Requirements
- **NFR-SEC-001 [Authentication & Token Integrity]:** User sessions must be signed using cryptographic secrets of at least 256 bits (`JWT_SECRET`). Tokens must be validated on every private route.
- **NFR-SEC-002 [Password Storage]:** Passwords must be hashed using `bcryptjs` with salt rounds $\ge 10$. Passwords must never be transmitted in server logs or query parameters.
- **NFR-SEC-003 [IDOR Defense]:** Insecure Direct Object Reference (IDOR) protection must be enforced across all resource mutations (appointments, follow-up plans, check-ins, assessments, chat sessions). Users shall only access records where `record.patientId === req.user.id` or when possessing an authorized clinical/admin role.
- **NFR-SEC-004 [Injection Mitigation]:** Database queries must utilize parameterized Mongoose schemas and `express-mongo-sanitize` to eliminate NoSQL operator injection attacks.
- **NFR-SEC-005 [Security Headers]:** The Express gateway must employ `helmet` middleware to enforce strict HTTP security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, and Content Security Policies.
- **NFR-SEC-006 [Rate Limiting]:** Authentication routes and LLM chat endpoints must enforce rate limiters (e.g., 5 login attempts per 15 min; 30 chat messages per 15 min per IP) to mitigate brute-force and resource exhaustion attacks.

### 5.2 Privacy & Regulatory Compliance (HIPAA & DISHA)
- **NFR-PRV-001 [Management Telemetry De-Identification]:** In strict compliance with HIPAA Privacy Rule §164.514, hospital management dashboards must never receive patient-identifiable data (PII/PHI). All operational metrics must be derived via server-side aggregation pipelines (`$group`, `$avg`).
- **NFR-PRV-002 [Audit Logging]:** All clinical record reviews, appointment status mutations, and assessment submissions must create an immutable audit record containing actor ID, target resource ID, action type, and UTC timestamp.
- **NFR-PRV-003 [Data Retention & Purging]:** Conversational health messages shall enforce a 365-day retention TTL index, ensuring automated deletion after regulatory expiration.
- **NFR-PRV-004 [SaMD Clinical Boundaries]:** All user-facing screens presenting risk calculations, ML inferences, or packaging matches must prominently display standardized regulatory disclaimers prohibiting autonomous self-treatment.

### 5.3 Concurrency, Data Integrity & Performance
- **NFR-PERF-001 [Zero Double-Booking Guarantee]:** The appointment reservation engine must employ atomic Compare-And-Swap (CAS) database queries, guaranteeing zero double-booked slots under concurrent patient booking requests.
- **NFR-PERF-002 [API Response Latency]:** Core CRUD endpoints (auth, doctor search, slot listing, appointment requests) shall respond within 150ms under nominal operational load ($P_{95} \le 250\text{ms}$).
- **NFR-PERF-003 [AI Gateway Timeout & Resilience]:** Requests to the Python AI microservice must enforce a 10,000ms deadline. In the event of microservice timeout or downtime, the Express gateway shall return HTTP 503 with a structured clinical notice without destabilizing the core Node.js process.
- **NFR-PERF-004 [Notification Idempotency]:** The notification worker must enforce unique compound deduplication keys, guaranteeing zero duplicate reminder dispatches even if the queue worker crashes or restarts mid-batch.

### 5.4 Reliability, Availability & Fault Tolerance
- **NFR-REL-001 [Microservice Decoupling]:** Failure of the Python AI microservice or external LLM APIs must not impede patient registration, doctor schedule management, appointment booking, or follow-up plan authoring.
- **NFR-REL-002 [Graceful Degradation]:** When the Python AI service is unreachable, the system shall seamlessly fall back to local deterministic rule engines (e.g., local NEWS2 scoring in Node.js and mock RAG responses).
- **NFR-REL-003 [Health Probes]:** Both Express (`/api/health`) and FastAPI (`/health`) shall expose lightweight HTTP health check endpoints for container orchestrators and uptime monitors.

### 5.5 Usability, Localization & Accessibility
- **NFR-USE-001 [Multilingual Support]:** The AI Health Assistant and voice interface shall support seamless switching between English and Hindi.
- **NFR-USE-002 [Responsive Mobile Usability]:** Core patient workflows (appointment booking, recovery check-in submission, risk assessment, and chat) must be fully operational on mobile screens with touch-friendly targets ($\ge 44 \times 44\text{ px}$).
- **NFR-USE-003 [Clinical Visual Hierarchy]:** Physiological alerts and triage tiers must follow intuitive clinical color semantics (Red for critical NEWS2 deterioration; Emerald for normal recovery).

### 5.6 Maintainability, DevOps & Cloud Deployment
- **NFR-OPS-001 [Containerized Orchestration]:** The entire distributed stack (React Client, Express API, FastAPI AI Service, MongoDB) shall be reproducible with a single command via `docker-compose.yml`.
- **NFR-OPS-002 [Cloud Deployment Support]:** The platform shall support multi-cloud deployment configurations (Vercel for frontend SPA, Render for API Server & Python AI service, MongoDB Atlas for database replica sets).
- **NFR-OPS-003 [Automated Test Coverage]:** The codebase shall maintain automated unit and integration test suites covering all sprint modules with 100% pass rate across core functional gates.

---

## 6. Requirements Traceability Matrix (RTM)

The following matrix maps every system requirement to its corresponding sprint deliverable, architectural module, primary actor, and automated verification test suite:

| Requirement ID | Module / Functional Scope | Sprint Deliverable | Primary Actor | Verification Test Suite | Status |
|---|---|---|---|---|:---:|
| **FR-AUTH-001–008** | Authentication, Bcrypt Hashing, Dual-Key JWT, RBAC, 1-Click Ribbon | Sprint 2, 7 | All Roles | `tests/sprint2.test.js` | ✅ Passed |
| **FR-DOC-001–006** | Doctor Directory, Specialty Search, Availability Slots | Sprint 3 | Doctor, Patient | `tests/sprint3.test.js` | ✅ Passed |
| **FR-APT-001–010** | CAS Concurrency Engine, Double-Booking Prevention, Lifecycle State Machine | Sprint 4, 8 | Patient, Doctor | `tests/sprint4.test.js`, `sprint8.test.js` | ✅ Passed |
| **FR-FUP-001–009** | Post-Discharge Care Plans, NEWS2 Recovery Scoring, NLP Deterioration Alerts | Sprint 5, ML-S5 | Clinician, Patient | `tests/sprint5.test.js`, `recovery_ml_sprint5.test.js` | ✅ Passed |
| **FR-NOTIF-001–005**| Idempotent Reminder Queue, Compound Deduplication Keys | Sprint 5, 8 | System | `tests/sprint5.test.js`, `sprint8.test.js` | ✅ Passed |
| **FR-CDS-001–007** | Framingham 10-Yr ASCVD, FINDRISC Diabetes Score, Pydantic Bounds | Sprint 6 | Patient, Clinician | `tests/sprint6.test.js`, `test_ai_service.py` | ✅ Passed |
| **FR-ML-001–009**  | ML-CVD-01 (Cleveland), ML-DIA-01 (BRFSS), Gated Future Tasks, Review Trail | Sprint 6, 7, 8 | Patient, Clinician | `tests/ml_assessments_sprint6.test.js`, `sprint7.test.js` | ✅ Passed |
| **FR-OCR-001–007** | Medicine Packaging Upload, Preprocessing, OCR Tokenizer, Candidate Matching | Sprint 6 | Patient | `tests/sprint6.test.js`, `test_sprint6_inference_endpoints.py` | ✅ Passed |
| **FR-DASH-001–006**| Role Dashboards (Patient, Doctor, Admin, Management HIPAA Barrier) | Sprint 7 | All Roles | `tests/sprint7.test.js`, `phase7_multi_role_integration.test.js` | ✅ Passed |
| **FR-CHAT-001–016**| Hybrid Conversational AI, Dual-RAG, NegEx, P0 Emergency Intercept, 2-Step Actions| Sprint 9–12 | Patient, Clinician | `tests/chat_sprint11.test.js`, `chatbot_release_gate_sprint12.test.js`| ✅ Passed |
| **FR-VOICE-001–006**| Web Speech STT, Neural TTS (Sarvam AI / OpenAI), Hindi/English Bilingual | S11–S12, Post-S12| Patient | `tests/chat_schema_validation.test.js`, Manual Audio Pass | ✅ Passed |
| **NFR-SEC-001–006**| JWT, IDOR Defense, Mongo Sanitize, Rate Limiting, Helmet Headers | Sprint 2, 8, 12 | System / DevOps | `tests/sprint8.test.js`, `chat_rate_limit.test.js` | ✅ Passed |
| **NFR-PERF-001–004**| Atomic CAS Concurrency, Sub-150ms Latency, 10s AI Deadline Fallbacks | Sprint 4, 8 | System / DevOps | `tests/sprint8.test.js` | ✅ Passed |
| **NFR-PRV-001–004**| HIPAA Management De-Identification, Audit Logging, DISHA 1-Yr Retention | Sprint 7, 11 | Management, Admin| `tests/sprint7.test.js`, `chat_sprint11.test.js` | ✅ Passed |

---

## 7. Verification, Validation & Acceptance Criteria

### 7.1 Automated Full-System Regression Gate
Acceptance of any production release or version milestone mandates a **100% pass rate** across all automated test suites:
- **Node.js Gateway Regression Suite:**
  - `sprint2.test.js`: Authentication, bcrypt password security, and RBAC route barriers (15/15 passed).
  - `sprint3.test.js`: Doctor profiles, directory filtering, and availability slot creation (17/17 passed).
  - `sprint4.test.js`: Appointment lifecycle state machine and double-booking conflict rejection (24/24 passed).
  - `sprint5.test.js` & `recovery_ml_sprint5.test.js`: Follow-up plans, recovery check-in triage, and idempotent reminder deduplication (24/24 passed).
  - `sprint6.test.js` & `ml_assessments_sprint6.test.js`: AI microservice proxying, Framingham, FINDRISC, and ML inference bounds (20/20 passed).
  - `sprint7.test.js`, `ml_assessments_sprint7.test.js`, & `phase7_multi_role_integration.test.js`: Role dashboards, HIPAA de-identification barrier, and assessment review trails (35/35 passed).
  - `sprint8.test.js` & `ml_release_gate_sprint8.test.js`: CAS concurrency race conditions, database transactions, and release baseline verification (24/24 passed).
  - `chat_sprint11.test.js`, `chat_rate_limit.test.js`, & `chatbot_release_gate_sprint12.test.js`: Dual-RAG retrieval, P0 emergency intercepts, NegEx negation handling, and 2-step action requisitions (28/28 passed).
- **Python AI Microservice Pytest Suite:**
  - `test_ai_service.py`, `test_phase4_orchestration_providers.py`, `test_phase5_hybrid_retrieval.py`, `test_phase6_clinical_guardrails.py`, `test_sprint10_chat_rag.py`: Pydantic boundary validation, BM25/LSA retrieval, emergency triage keywords, NegEx negation handling, and candidate OCR matching.

### 7.2 Clinical Safety & Ethics Sign-Off Criteria
1. **Zero Hallucinated Emergency Advice:** Under no circumstances shall the platform delay emergency medical intervention for acute symptoms (crushing chest pain, severe dyspnea, acute stroke, suicidal ideation). All such inputs must trigger the Priority-0 emergency card with direct dials for 112, 108, and Tele-MANAS (14416).
2. **Zero Unchecked Prescriptions:** The conversational assistant and OCR matcher shall never recommend specific drug dosages or autonomously instruct a patient to begin, alter, or discontinue medication.
3. **Strict Consequential Action Confirmation:** The system shall never book, reschedule, or cancel a clinical consultation without an explicit, interactive two-step user confirmation card.

---

## 8. Appendix: Glossary & Technical Acronyms

| Acronym / Term | Definition |
|---|---|
| **ASCVD** | Atherosclerotic Cardiovascular Disease (Framingham 10-Year Risk Engine). |
| **BRFSS** | Behavioral Risk Factor Surveillance System (CDC annual epidemiological health survey). |
| **CAS** | Compare-And-Swap (atomic concurrency primitive used to prevent double-booking). |
| **CDS** | Clinical Decision Support (advisory software assisting healthcare providers). |
| **DISHA** | Digital Information Security in Healthcare Act (Indian health data privacy standard). |
| **FINDRISC** | Finnish Diabetes Risk Score (validated 10-year type-2 diabetes risk assessment tool). |
| **HIPAA** | Health Insurance Portability and Accountability Act of 1996 (United States). |
| **IDOR** | Insecure Direct Object Reference (security vulnerability allowing unauthorized tenant data access). |
| **LSA** | Latent Semantic Analysis (dense semantic dimensionality reduction via TruncatedSVD). |
| **NEWS2** | National Early Warning Score 2 (standardized clinical early warning deterioration score). |
| **OCR** | Optical Character Recognition (PyTesseract packaging text extraction). |
| **PHI / PII** | Protected Health Information / Personally Identifiable Information. |
| **RAG** | Retrieval-Augmented Generation (grounding LLM outputs in verified external corpora). |
| **RBAC** | Role-Based Access Control (Patient, Doctor, Management, Admin). |
| **SaMD** | Software as a Medical Device (FDA/CDSCO clinical decision support regulatory boundary). |
| **STT / TTS** | Speech-to-Text / Text-to-Speech (Web Speech API, Sarvam AI Bulbul V3, OpenAI Nova). |
| **TTL** | Time-To-Live (automated MongoDB index expiration mechanism for 365-day chat retention). |
| **Wong-Baker** | Validated clinical visual pain rating scale (0 = no hurt, 10 = hurts worst). |

---

*End of Specification — SwasthyaCare Engineering & Clinical Informatics Team*
