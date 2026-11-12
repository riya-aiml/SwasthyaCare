# Product Requirements Document (PRD) & Intent Catalogue
## SwasthyaCare Hybrid Conversational AI Assistant

**Sprint:** Sprint 9  
**Task ID:** S9-03  
**Status:** APPROVED  
**Version:** 1.0.0  

---

## 1. Product Mission & Goals

The SwasthyaCare AI Assistant is an intelligent, bounded clinical companion integrated into the patient portal and clinician workspace. It bridges hospital administrative workflows and patient education while upholding the highest standards of clinical safety, data isolation, and regulatory compliance.

### Core Objectives:
1. **Reduce Administrative Friction:** Assist patients in navigating doctor appointments, finding appropriate clinical specialists, understanding OPD wait times, and accessing past risk assessments.
2. **Provide Evidence-Based Health Education:** Deliver verified, citation-backed lifestyle and preventive health advice sourced exclusively from ICMR, WHO, and National Health Portal guidelines.
3. **Clinical Safety Guarantee:** Prevent medical hallucinations, intercept acute medical emergencies with immediate crisis hotline routing, and never issue pharmacological prescriptions.

---

## 2. Intent Taxonomy & Routing Matrix

Every user message is classified into a primary intent category with strict priority ordering:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Input Received                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  [ Priority 0: Safety Emergency Check ]
                  Is acute distress / red flag detected?
                                 /      \
                             YES          NO
                             /              \
             [ INTENT_EMERGENCY ]        [ Intent Classifier ]
             - Immediate 112/108/TeleMANAS          │
             - Red-flag warning banner              ├─► [ INTENT_APP_ACTION ] (Booking/Cancel)
             - Zero clinical speculation            ├─► [ INTENT_APP_NAVIGATION ] (How-to/Queue)
                                                    ├─► [ INTENT_CLINICAL_QA ] (ICMR/WHO RAG)
                                                    ├─► [ INTENT_REPORT_EXPLANATION ] (Own labs)
                                                    └─► [ INTENT_GENERAL_CHITCHAT ] (Greetings)
```

### Intent Details:

| Intent ID | Priority | Description | Example Queries | Action / Retrieval Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `INTENT_EMERGENCY` | **P0 (Highest)** | Acute medical emergencies, red-flag symptoms, severe mental health crisis. | *"Chest hurts radiating to left arm"*, *"Can't breathe"*, *"Want to end my life"* | **Hard Red Flag Intercept:** Output emergency hotline numbers (112, 108, Tele-MANAS 14416), advise immediate ER visit. No general RAG. |
| `INTENT_APP_ACTION` | **P1** | Consequential platform actions (book, reschedule, cancel appointment). | *"Book appointment with Dr. Sharma tomorrow"*, *"Cancel my appointment"* | Extracts slots/parameters. **Requires explicit 2-step user confirmation dialog**. Never executes unilaterally. |
| `INTENT_APP_NAVIGATION`| **P1** | Platform navigation, OPD queue mechanics, doctor discovery, follow-ups. | *"How do I submit my post-discharge update?"*, *"Where can I see available cardiologists?"* | Queries **Platform Corpus** for SwasthyaCare feature guides and workflows. |
| `INTENT_REPORT_EXPLANATION`| **P1** | Queries regarding own past ML risk assessments or lab results. | *"What does my 15% diabetes risk score mean?"*, *"Explain my Framingham score"* | Ingests confirmed, authorized patient assessment record (`req.user.id`). Explains statistical concepts with mandatory clinical disclaimer. |
| `INTENT_CLINICAL_QA` | **P2** | Preventive health, diet, lifestyle, disease management inquiries. | *"What foods lower systolic blood pressure?"*, *"What are common early signs of diabetes?"* | Queries **Healthcare Clinical Corpus** (ICMR/WHO). Generates response with mandatory inline source citations. |
| `INTENT_GENERAL_CHITCHAT`| **P3** | Greetings, thanks, polite conversational closings, off-topic requests. | *"Hello"*, *"Thank you"*, *"Who made you?"*, *"Write a poem"* | Polite greeting or polite out-of-scope deflection. Zero retrieval overhead. |

---

## 3. Explicit Non-Goals (Scope Boundaries)

The SwasthyaCare Assistant strictly enforces the following non-goals:
1. **NO Autonomous Medical Diagnoses:** The model shall never say *"You have condition X"*. It will only state *"These symptoms may be associated with several conditions; a doctor must evaluate you."*
2. **NO Prescription or Drug Dosage Recommendations:** The assistant is explicitly prohibited from suggesting specific drug dosages (e.g. *"Take 500mg Paracetamol"* or *"Start Metformin"*).
3. **NO Unilateral Database Mutations:** The assistant cannot directly create, update, or cancel database records without presenting an interactive confirmation card to the user.
4. **NO Cross-Patient or Cross-User Data Access:** A patient can never view or query another patient's appointments, risk scores, or chat history under any circumstance.
5. **NO Triage of Life-Threatening Emergencies:** The assistant shall never attempt to manage or delay care for cardiac arrest, severe trauma, respiratory collapse, or acute poisonings.
