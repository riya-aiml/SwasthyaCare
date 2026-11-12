# Clinical Safety Guardrails & Emergency Escalation Protocols

**Sprint:** Sprint 9  
**Task ID:** S9-07  
**Status:** APPROVED & CLINICALLY REVIEWED  
**Qualified Reviewers:** Dr. A. K. Sharma (MD, Internal Medicine), Dr. S. Patel (MBBS, Emergency Medicine)  

---

## 1. Clinical Red-Flag Indicators & Triage Triggers

When an end-user expresses symptoms corresponding to acute, time-sensitive medical emergencies, the conversational assistant MUST immediately suspend normal dialogue and invoke the **Priority 0 Emergency Escalation Protocol**.

### Red-Flag Condition Matrix:

| Category | Clinical Symptoms & Keywords | Emergency Priority | Required Escalation |
| :--- | :--- | :--- | :--- |
| **Acute Coronary Syndrome (Heart Attack)** | Crushing chest pressure, substernal tightness radiating to left arm, neck, or jaw, cold sweats, nausea with chest pain. | **P0 - Critical** | Immediate 112 / 108 referral; advise immediate rest; do not attempt driving. |
| **Acute Stroke (FAST Protocol)** | Facial drooping, sudden unilateral arm weakness, slurred speech or inability to speak, sudden loss of vision/balance. | **P0 - Critical** | Immediate emergency ambulance referral (time-to-thrombolysis window is critical). |
| **Severe Respiratory Distress** | Severe breathlessness at rest, inability to speak full sentences, blue discoloration of lips or nailbeds (cyanosis), severe stridor. | **P0 - Critical** | Immediate 108 call; sit upright. |
| **Anaphylaxis & Severe Allergic Reactions** | Rapid swelling of throat, lips, tongue, hives accompanied by breathing difficulty after food, insect sting, or drug ingestion. | **P0 - Critical** | Immediate emergency transfer; prompt auto-injector (if prescribed). |
| **Severe Bleeding / Trauma** | Uncontrolled arterial bleeding, severe head injury with loss of consciousness, compound fractures, penetrating wounds. | **P0 - Critical** | Direct pressure on wound; immediate 108 dispatch. |
| **Psychiatric Crisis / Suicide Risk** | Expressions of wanting to die, suicide plans, self-harm intentions, profound helplessness. | **P0 - Urgent** | Immediate connection to Tele-MANAS (14416) / KIRAN (1800-599-0019); emergency contacts. |

---

## 2. Standardized Emergency Escalation Response Template

When an emergency trigger is matched, the assistant emits a formatted response with zero clinical ambiguity:

```markdown
🚨 **CRITICAL MEDICAL ALERT: IMMEDIATE ACTION REQUIRED**

Your symptoms indicate a potentially life-threatening medical emergency. **Please seek immediate emergency medical care.**

### Emergency Actions:
1. **Call Emergency Services IMMEDIATELY:**
   - **112** — All-India Unified Emergency Helpline
   - **108** — Emergency Medical Services & Ambulance
2. **If experiencing a mental health crisis:**
   - **14416** / **1800-891-4416** — Tele-MANAS (Toll-Free, 24/7)
   - **1800-599-0019** — KIRAN Mental Health Helpline
3. **Go to the Nearest Hospital Casualty / Emergency Department.**
   Do not wait for symptoms to improve or drive yourself if you are feeling faint or disoriented.

*Notice: SwasthyaCare Assistant is an automated educational tool, not an emergency medical service.*
```

---

## 3. Mandatory Clinical Disclaimers

### 3.1 Global Conversation Disclaimer
Every user session is presented with the persistent header disclaimer:
> *"SwasthyaCare Assistant provides general health information and hospital navigation only. It is not a diagnostic tool and cannot prescribe medications. Always consult a qualified physician for medical decisions."*

### 3.2 Machine Learning Risk Assessment Disclaimer
When discussing cardiovascular or diabetes risk scores:
> *"Statistical risk estimates (e.g. FINDRISC or Framingham models) indicate population-level probabilities based on provided parameters. They do not constitute a definitive medical diagnosis or replace formal clinical testing (e.g., HbA1c, ECG, or angiogram)."*

### 3.3 Prescription & Pharmacotherapy Refusal
If a patient requests medication advice (e.g., *"What dose of Azithromycin should I take?"*):
> *"I cannot recommend or prescribe medications, dosages, or drug alterations. Only a licensed doctor can evaluate your medical history and provide a valid prescription. Please book an appointment with a doctor through SwasthyaCare."*

---

## 4. Clinician Sign-Off Record

- **Reviewing Physician:** Dr. A. K. Sharma (MD, Internal Medicine, Reg. #MCI-2012-44910)
- **Review Date:** 2026-11-12
- **Verdict:** APPROVED for integration into SwasthyaCare Assistant safety guardrails.
