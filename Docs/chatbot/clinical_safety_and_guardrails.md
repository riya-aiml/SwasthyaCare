# SwasthyaCare Clinical Safety Policy & Algorithmic Guardrails
## Emergency Protocols, SaMD Boundaries, Prescriptive Restrictions & Privacy Protection

**Document ID:** SWC-CB-SAFE-001  
**Sprint:** Sprint 9 — Discovery, Product Foundation & Safety Design (Tasks `S9-09`, `S9-10`, `S9-11`)  
**Status:** ✅ APPROVED  
**Date:** 2026-11-11  
**Component:** SwasthyaCare Conversational AI Assistant Subsystem  

---

## 1. Regulatory Context & Scope of Operation

The SwasthyaCare AI Health Assistant operates under the regulatory definition of an **Informational Clinical Decision Support Tool (CDSS / SaMD Prototype)**. 

### Core Ethical Mandate
* The assistant is designed to **empower and educate**, never to replace licensed clinical judgment.
* The assistant is strictly prohibited from asserting definitive diagnoses, modifying drug dosages, interpreting unconfirmed laboratory data, or dissuading patients from seeking emergency care.

---

## 2. Emergency Red-Flag Triage Protocols (`S9-09`)

When a patient query contains indicators of immediate, acute life-threatening medical conditions, normal RAG retrieval is **preempted immediately**. The system returns a hardcoded, high-visibility emergency card directing the patient to emergency medical services.

### Red-Flag Clinical Categories & Triggers

| Category | Clinical Presentation & Keywords | Immediate System Response | Action Triggered |
|---|---|---|---|
| **Cardiovascular Emergencies** | Crushing substernal chest pain, pressure radiating to left arm/jaw, acute diaphoresis, sudden syncope | Emergency Red Banner: *"Possible Acute Coronary Syndrome. Call 112 or 108 immediately. Do not drive yourself to hospital."* | Display Emergency Modal; lock further automated triage questions |
| **Cerebrovascular (FAST)** | Sudden facial droop, arm weakness/numbness, slurred speech, acute visual loss | Emergency Red Banner: *"Possible Acute Stroke. Immediate emergency department evaluation required within 3-4.5 hours."* | Dial 112/108 quick-action button |
| **Severe Respiratory Distress** | Inability to speak in full sentences, cyanosis (blue lips), acute stridor, severe wheezing | Emergency Red Banner: *"Severe Respiratory Distress. Seek immediate emergency care."* | Urgent triage escalation |
| **Anaphylaxis & Shock** | Swollen tongue/throat after allergen, severe urticaria, rapid dizziness, hypotension | Emergency Red Banner: *"Possible Anaphylactic Reaction. Administer auto-injector if prescribed and call emergency services."* | Immediate emergency prompt |
| **Crisis & Psychiatric Emergency** | Suicidal ideation, intent to self-harm, acute psychosis | Compassionate Crisis Banner: *"National Tele-MANAS Mental Health Helpline: 14416 (India) or 112. Free, 24/7 confidential support."* | Tele-MANAS hotline quick-link |

```javascript
// Emergency Regex Pattern Matcher (Executed in FastAPI pre-check)
const EMERGENCY_PATTERNS = [
  /\b(chest pain|heart attack|crushing pain in chest|pain radiating to arm)\b/i,
  /\b(stroke|facial droop|slurred speech|arm numbness)\b/i,
  /\b(can't breathe|cannot breathe|suffocating|gasping for air)\b/i,
  /\b(kill myself|suicide|end my life|want to die|self harm)\b/i,
  /\b(anaphylaxis|throat closing up|swollen tongue)\b/i
];
```

---

## 3. Prescriptive & Pharmacological Boundaries

### Rule 1: No Prescription Generation or Alteration
* **Strict Invariant:** The assistant **never** suggests starting, stopping, increasing, or decreasing any prescription medication.
* If a patient asks: *"Should I stop taking Metformin?"* or *"Can I double my Amlodipine dose?"*
  * **System Response:** *"I cannot advise you on changing, stopping, or adjusting prescription medications. Dosage changes must only be directed by your prescribing clinician. Please message your treating doctor or schedule a follow-up consultation."*

### Rule 2: Medicine Packaging & OCR Inquiries
* The assistant references medicines **only** in the context of verified formulary educational descriptions (e.g. active ingredients, common indications, general storage advice).
* Inquiries regarding unconfirmed medicine packaging OCR images will return:
  * *"This image packaging has not been confirmed. Please verify the printed label on your prescription box directly with your pharmacist."*

---

## 4. Laboratory Report & ML Assessment Explanations

### Rule 3: Confirmed OCR Provenance Requirement
* The assistant is prohibited from explaining laboratory blood tests, HbA1c, or lipid panels unless the record in MongoDB has `provenance.patientConfirmed === true`.
* If a patient provides unverified text from an OCR scan:
  * The assistant prompts: *"I notice this laboratory parameter has not yet been verified. Please review the values against your physical paper report in the Health Records section before I provide educational explanations."*

### Rule 4: Non-Diagnostic Model Descriptions
* When discussing `ML-DIA-01` or `ML-CVD-01`, the assistant must:
  1. State the exact model version (`v1.0.0`).
  2. Quote the calibrated continuous probability score.
  3. Use non-diagnostic phraseology (e.g. *"Your profile indicates elevated survey markers consistent with diabetes risk patterns"*, NOT *"You have diabetes"*).
  4. Remind the patient that fasting plasma glucose / HbA1c laboratory testing is required for medical diagnosis.

---

## 5. Tool Allow-List & Action Confirmation (`S9-10`)

The assistant is equipped with read-only and action-suggestion tools, but **zero autonomous database write permissions**:

| Tool Name | Tool Type | Permissions | Confirmation Protocol |
|---|---|---|---|
| `get_my_appointments` | Read | Authenticated Patient (`req.user._id`) | Automatic execution |
| `get_my_assessments` | Read | Authenticated Patient (`req.user._id`) | Automatic execution |
| `get_doctor_availability` | Read | Public Directory | Automatic execution |
| `suggest_appointment_booking` | Suggestion | Client Action Card | Requires user to review slot and click **"Confirm Booking"** |
| `suggest_cancellation` | Suggestion | Client Action Card | Requires user to confirm slot release in modal |
| `navigate_to_page` | Navigation | Client Navigation Handler | One-click button (allow-listed paths: `appointments`, `risk-assessment`, `followup`, `directory`) |
| `escalate_to_doctor` | Handoff | Clinician Notification Queue | Creates a non-urgent triage message in doctor's inbox upon patient confirmation |

---

## 6. Data Retention, HIPAA & Operational Privacy Policy (`S9-11`)

1. **Patient Data Isolation:**
   * Chat sessions are indexed by `{ patient: req.user._id }`.
   * Cross-tenant inspection (`GET /api/chat/sessions/:id` for another patient) returns **HTTP 403 Forbidden**.
2. **Right to Erasure (Session Deletion):**
   * Patients have the right to clear or delete any chat session (`DELETE /api/chat/sessions/:id`).
   * Deletion performs a hard cascade delete of associated messages from `chatMessages`.
3. **Log Sanitization:**
   * Server logs record metadata only (`timestamp`, `userId`, `sessionId`, `latencyMs`, `intent`).
   * Raw conversation text, prompt vectors, and patient biometrics are **never** logged to server stdout or external monitoring aggregators.
4. **Mandatory SaMD Disclaimer (Appears on every chat response):**
   > *"EDUCATIONAL DECISION-SUPPORT PROTOTYPE ONLY: SwasthyaCare Assistant provides non-diagnostic health navigation. It does not replace medical consultation. For emergencies, dial 112 or 108."*
