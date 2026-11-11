# Product Requirements Document (PRD) & Feature Catalogue
## SwasthyaCare AI Health Assistant & Clinical Navigation Subsystem

**Document ID:** SWC-CB-PRD-001  
**Sprint:** Sprint 9 — Discovery, Product Foundation & Safety Design (Tasks `S9-04`, `S9-10`)  
**Status:** ✅ APPROVED  
**Date:** 2026-11-11  
**Component:** SwasthyaCare Conversational AI Assistant Subsystem  

---

## 1. Executive Summary & Product Vision

The SwasthyaCare AI Health Assistant is an intelligent, grounded conversational companion integrated directly into the SwasthyaCare digital healthcare platform. It provides 24/7 navigation assistance, translates complex machine learning risk assessments into plain-language educational insights, explains verified laboratory test parameters, and connects patients directly with clinical specialists.

### Core Value Propositions
1. **Frictionless Navigation:** Patients can find doctors, check live OPD wait times, and initiate appointment reservations through natural dialogue.
2. **Explainable AI (XAI):** Demystifies `ML-DIA-01` and `ML-CVD-01` risk indicators by explaining the physiological meaning of factors like BMI, resting BP, and lifestyle markers.
3. **Clinical Safety by Design:** Hardcoded red-flag emergency detection preempts conversation to deliver immediate emergency assistance (112/108), adhering strictly to FDA SaMD non-diagnostic boundaries.

---

## 2. Feature Catalogue & Scope Matrix (`S9-04`)

| Feature ID | Capability Description | Priority | Delivery Sprint | Target User Role |
|---|---|:---:|:---:|:---:|
| **CB-FEAT-01** | **Floating Interactive Chat Widget** with minimization, message history, and quick prompts | P0 (Must) | Sprint 11 | Patient |
| **CB-FEAT-02** | **App Navigation & Workflow Help** (Booking, CAS slot locking, OPD queue status) | P0 (Must) | Sprint 10–11 | Patient / Clinician |
| **CB-FEAT-03** | **Emergency Red-Flag Interceptor** (Immediate 112/108 emergency card on chest pain/stroke) | P0 (Must) | Sprint 10 | Patient |
| **CB-FEAT-04** | **ML Risk Assessment Explainer** (Plain-language explanations of `ML-DIA-01` and `ML-CVD-01`) | P0 (Must) | Sprint 11 | Patient |
| **CB-FEAT-05** | **Grounded Clinical Health Q&A** (Citing ICMR, WHO, MoHFW guidelines) | P0 (Must) | Sprint 10 | Patient |
| **CB-FEAT-06** | **Confirmed Lab Report OCR Explanation** (Explaining patient-confirmed blood biomarkers) | P1 (Should)| Sprint 11 | Patient |
| **CB-FEAT-07** | **Appointment Assistant with Action Cards** (One-click booking confirmation cards) | P0 (Must) | Sprint 11 | Patient |
| **CB-FEAT-08** | **Session History & Erasure** (Multi-tenant isolation and Right to Delete sessions) | P0 (Must) | Sprint 11 | Patient |
| **CB-FEAT-09** | **User Feedback Loop** (Thumbs Up / Thumbs Down rating on individual assistant messages) | P1 (Should)| Sprint 11 | Patient |
| **CB-FEAT-10** | **Clinician Escalation & Handoff** (Forwarding urgent questions to assigned treating doctor) | P2 (Could)  | Sprint 12 | Patient / Clinician |

---

## 3. Key User Journeys

### User Journey 1: Understanding an Elevated Diabetes Risk Score
1. Patient Aarav logs in and navigates to **AI Risk Scoring**.
2. Aarav's `ML-DIA-01` result returns a calibrated probability of **$68\%$** (*Reported Profile Consistent with Elevated Diabetes Indicator Pattern*).
3. Aarav opens the AI Health Assistant widget and clicks the quick prompt: *"Explain my diabetes assessment factors"*.
4. The assistant securely retrieves Aarav's latest assessment (v1.0.0) and explains:
   * *"Your assessment identified high blood pressure and a BMI of 29.5 kg/m² as primary drivers. According to ICMR guidelines, a BMI $\ge 23$ kg/m² represents an overweight threshold for South Asian adults."*
   * Displays an interactive button: **[Schedule Consultation with Endocrinologist]**.

### User Journey 2: Emergency Symptom Interception (Red-Flag Protocol)
1. Patient enters: *"I have sudden squeezing chest pain and my left shoulder is aching."*
2. System intercepts acute cardiovascular keywords **before** any RAG retrieval.
3. System displays an immediate high-priority alert card:
   * *"🚨 Immediate Emergency Attention Required. These symptoms may indicate an acute cardiovascular event."*
   * One-click action button: **[Call Emergency Services: 112 / 108]**.
   * Disables automated chat inputs to prevent delayed medical care.

### User Journey 3: Appointment Booking Assistance with Explicit Confirmation
1. Patient enters: *"Are there any cardiologists available this Thursday?"*
2. Assistant queries doctor directory $\to$ finds Dr. Rohan Verma with an open 10:00 AM slot.
3. Assistant displays an **Appointment Action Card** detailing date, time, and doctor.
4. Assistant prompts: *"Would you like me to reserve this consultation for you?"*
5. Patient clicks **[Confirm Reservation]** $\to$ triggers existing atomic CAS reservation API $\to$ returns confirmed booking receipt.

---

## 4. Non-Functional Requirements (NFRs)

* **Response Latency:** $< 1,500$ ms for intent classification & RAG responses; $< 100$ ms for hardcoded emergency intercepts.
* **Security & Privacy:** 100% tenant isolation (Patient A cannot read Patient B's chat history); zero credential logging.
* **Availability & Resilience:** Automatic local deterministic fallback if external LLM provider encounters rate limiting or network downtime.
* **SaMD Regulatory Compliance:** Disclaimers present on every response; non-diagnostic terminology strictly enforced.
