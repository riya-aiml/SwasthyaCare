# Knowledge Source Register, Retrieval Scopes & Intent Taxonomy
## Grounded RAG Knowledge Base Architecture for SwasthyaCare Assistant

**Document ID:** SWC-CB-KNOW-001  
**Sprint:** Sprint 9 — Discovery, Product Foundation & Safety Design (Tasks `S9-05`, `S9-08`)  
**Status:** ✅ APPROVED  
**Date:** 2026-11-11  
**Component:** SwasthyaCare Grounded RAG Retrieval Engine  

---

## 1. Intent Taxonomy & Routing Logic (`S9-05`)

Incoming patient queries are evaluated by the FastAPI intent router to direct queries into the proper knowledge retrieval pipeline or safety protocol:

```text
                                [ Incoming Patient Message ]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             [ Red-Flag Keywords? ]                       [ Intent Classifier ]
                       │                                           │
             YES ──────┴──────► [ EMERGENCY_RED_FLAG ]             ├─► [ APP_HELP ] (Scope A)
                                (Immediate 112/108 card)           ├─► [ HEALTH_INFO ] (Scope B)
                                                                   ├─► [ ASSESSMENT_EXPLAIN ] (Patient Context)
                                                                   ├─► [ REPORT_EXPLAIN ] (Confirmed OCR)
                                                                   ├─► [ APPOINTMENT_ASSIST ] (Slot Context)
                                                                   └─► [ OUT_OF_SCOPE ] (Refusal Card)
```

### Intent Classification Specifications

| Intent ID | Description | Typical Query Examples | Target Knowledge Scope / Tool |
|---|---|---|---|
| `EMERGENCY_RED_FLAG` | Acute life-threatening symptoms requiring immediate emergency care | *"Chest pain radiating to my left arm"*, *"Cannot breathe"*, *"Slurred speech and face droop"* | Safety Pre-Check (No RAG; immediate emergency hotline card) |
| `APP_HELP` | How to use SwasthyaCare features, navigation, and hospital workflows | *"How do I book a consultation?"*, *"What does live queue status mean?"*, *"How to upload a prescription?"* | **Scope A: SwasthyaCare Application Docs** |
| `HEALTH_INFO` | Evidence-based lifestyle, nutrition, and non-prescriptive medical education | *"What are normal blood pressure ranges?"*, *"What exercises are good for prediabetes?"*, *"What is an HbA1c test?"* | **Scope B: Verified Clinical Guidelines** |
| `ASSESSMENT_EXPLAIN` | Explaining calculated risk scores (`ML-DIA-01`, `ML-CVD-01`, Framingham) | *"Why did my diabetes screening show high risk?"*, *"What contributed to my cardiovascular score?"* | Patient Assessment Record + Model Card Metadata |
| `REPORT_EXPLAIN` | Explaining confirmed diagnostic laboratory test parameters | *"What does serum creatinine 1.1 mg/dL mean on my report?"*, *"Is my cholesterol high?"* | Confirmed Laboratory OCR Parameters |
| `APPOINTMENT_ASSIST` | Finding specialists, checking slot availability, booking guidance | *"Are there any cardiologists available tomorrow afternoon?"*, *"Cancel my upcoming visit"* | Doctor Directory + Availability Slot API |
| `OUT_OF_SCOPE` | Non-medical, legal, financial, or political queries | *"Who will win the election?"*, *"Give me coding advice"* | Graceful Refusal Protocol |

---

## 2. Separation of Knowledge Scopes (`S9-08`)

To prevent hallucination, outdated guidance, and cross-domain pollution, the retrieval engine strictly segregates its vector search spaces into two isolated vector collections:

### Scope A: SwasthyaCare Application Knowledge Base

* **Storage:** `ai-service/data/knowledge_base/app_docs/`
* **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2` (Local, high speed)
* **Chunking Strategy:** Semantic Markdown header chunking (Chunk size 350 tokens, overlap 50 tokens).
* **Metadata Fields:** `doc_id`, `category` (`appointments`, `queue`, `followup`, `risk_models`, `profiles`), `last_updated`.

#### Registered Scope A Documents:
1. `SWC-APP-01: Appointment Booking & CAS Locking Protocols`: Explains how slot locking works, atomic reservation, approval workflows, and rescheduling rules.
2. `SWC-APP-02: Live OPD Queue & Token Tracking`: Explains queue delay estimations, doctor status markers, and clinic check-in.
3. `SWC-APP-03: Post-Discharge Recovery & Symptom Check-ins`: Explains daily recovery ratings, vital signs monitoring, and how warning flags alert clinicians.
4. `SWC-APP-04: AI Clinical Decision Support Engines`: Explains the difference between screening prototypes (`ML-DIA-01`, `ML-CVD-01`) and formal medical diagnosis.
5. `SWC-APP-05: Medicine Packaging OCR Scanner`: Explains how camera captures medicine tokens and how patient confirmation is required.

---

### Scope B: Verified Healthcare & Public Health Guidelines

* **Storage:** `ai-service/data/knowledge_base/clinical_guidelines/`
* **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2`
* **Chunking Strategy:** Recursive character chunking (Chunk size 400 tokens, overlap 60 tokens).
* **Metadata Fields:** `source_id`, `institution`, `guideline_name`, `publication_year`, `citation_title`, `url_or_section`.

#### Registered Scope B Source Register:

| Source ID | Institution / Author | Guideline Title | Scope of Information | Version / Year | Citation Format |
|---|---|---|---|:---:|---|
| `ICMR-DIA-2023` | Indian Council of Medical Research (ICMR) | Guidelines for Management of Type 2 Diabetes in India | South Asian BMI cutoffs ($\ge 23$ overweight, $\ge 25$ obese), dietary fiber, physical activity, HbA1c diagnostic targets ($< 7.0\%$) | 2023 | *ICMR Guidelines for Management of Type 2 Diabetes in India (2023)* |
| `ICMR-HTN-2022` | Indian Council of Medical Research (ICMR) | Guidelines for Management of Hypertension | Normal BP ($< 120/80$), Stage 1 hypertension ($\ge 140/90$), sodium reduction, DASH diet | 2022 | *ICMR Management of Hypertension Guidelines (2022)* |
| `WHO-CVD-2021` | World Health Organization (WHO) | Guideline for the Pharmacological and Non-Pharmacological Treatment of Hypertension in Adults | Cardiovascular lifestyle risk factors, smoking cessation, aerobic exercise guidelines | 2021 | *WHO Cardiovascular Prevention Guidelines (2021)* |
| `ADA-SOC-2024` | American Diabetes Association (ADA) | Standards of Medical Care in Diabetes | Fasting blood glucose cutoffs ($\ge 126$ mg/dL), OGTT benchmarks, lifestyle therapy | 2024 | *ADA Standards of Medical Care (2024)* |
| `ACC-AHA-2019` | ACC / AHA | Primary Prevention of Cardiovascular Disease | 10-Year ASCVD risk categories, lipid profiles, LDL targets | 2019 | *ACC/AHA Primary Prevention Guidelines (2019)* |

---

## 3. Strict Citation Verification Engine (`S10-07`)

Every response generated by the RAG engine must link statements to retrieved chunk metadata:
* **Invariant:** The assistant cannot assert a clinical parameter or lifestyle recommendation without citing a verified `source_id`.
* If a response quotes an optimal blood pressure target, it must return structured citations:
  ```json
  "citations": [
    {
      "source_id": "ICMR-HTN-2022",
      "title": "ICMR Management of Hypertension Guidelines (2022)",
      "url_or_section": "Chapter 3: Lifestyle Management and Sodium Reduction"
    }
  ]
  ```
* In the frontend React chat window, citations are rendered as interactive clickable badges that show the verified institutional reference and publication year.
