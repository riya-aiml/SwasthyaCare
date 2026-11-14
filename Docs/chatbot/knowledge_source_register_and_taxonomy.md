# Knowledge Source Register & Provenance Taxonomy
## SwasthyaCare Dual-Corpus RAG Architecture

**Sprint:** Sprint 9  
**Task ID:** S9-06  
**Status:** APPROVED  
**Review Ownership:** Clinical Informatics Team & Lead Medical Officer  

---

## 1. Dual-Corpus Separation Architecture

To guarantee strict isolation between operational platform workflows and clinical healthcare guidelines, the knowledge base is split into two physically segregated corpora:

```
                            [ Knowledge Base Root ]
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
       [ Platform Corpus ]                         [ Healthcare Corpus ]
   (SwasthyaCare Application Workflows)         (Peer-Reviewed Clinical Guidelines)
   - Scope: Appointments, OPD Queue,           - Scope: Diabetes, Hypertension, CVD,
     Follow-ups, ML Risk Model Docs              Lifestyle, Mental Health
   - Target: INTENT_APP_NAVIGATION              - Target: INTENT_CLINICAL_QA
```

---

## 2. Platform Corpus Register (SwasthyaCare Systems)

| Doc ID | Document Title | Domain / Workflows Covered | Primary Author | Review Cadence |
| :--- | :--- | :--- | :--- | :--- |
| `DOC-PLAT-01` | `swc_appointments_and_booking.md` | Doctor search, specialty discovery, slot booking rules, cancellation window (24h), status lifecycle (`PENDING` ➔ `APPROVED` ➔ `COMPLETED`). | Lead Systems Engineer | Bi-monthly |
| `DOC-PLAT-02` | `swc_opd_queue_and_followup.md` | Live OPD digital token queue, estimated consultation wait times, post-discharge recovery check-in forms, automated follow-up alerts. | OPD Operations Lead | Monthly |
| `DOC-PLAT-03` | `swc_ai_risk_models.md` | Clinical decision support models (`ML-CVD-01`, `ML-DIA-01`), input parameters (BP, cholesterol, BMI, glucose), probability scores vs diagnostic confirmation, SaMD disclaimer rules. | ML Engineering Lead | Every Model Release |

---

## 3. Healthcare Clinical Knowledge Register (Peer-Reviewed Guidelines)

| Doc ID | Clinical Guideline Title | Source Organization | Reference Standard | Clinical Reviewer | Expiry / Review Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DOC-CLIN-01` | `icmr_diabetes_guidelines.md` | Indian Council of Medical Research (ICMR) | Guidelines for Management of Type 2 Diabetes in India (2023) | Consultant Diabetologist | Annual (2027-11) |
| `DOC-CLIN-02` | `icmr_hypertension_guidelines.md`| ICMR / Association of Physicians of India | Indian Guidelines on Hypertension-IV (IGH-IV) | Consultant Cardiologist | Annual (2027-11) |
| `DOC-CLIN-03` | `who_cardiovascular_prevention.md`| World Health Organization (WHO) | HEARTS Technical Package for CVD Risk Management in Primary Health Care | Public Health Specialist | Annual (2027-11) |
| `DOC-CLIN-04` | `lifestyle_diet_and_preventive_care.md`| MoHFW (National Health Portal) | National Dietary & Physical Activity Guidelines for Indians | Clinical Dietitian | Semi-annual |
| `DOC-CLIN-05` | `mental_health_and_wellness.md`| National Institute of Mental Health and Neurosciences (NIMHANS) | Tele-MANAS Mental Health Support & Stress Management Protocol | Clinical Psychologist | Semi-annual |

---

## 4. Document Ingestion & Chunking Standards (Sprint 10 Target)

Each knowledge document must adhere to standardized metadata frontmatter:

```markdown
---
id: DOC-CLIN-01
title: ICMR Type 2 Diabetes Management Guidelines
category: clinical_guidelines
source_organization: ICMR
publication_year: 2023
review_status: APPROVED
approved_by: Dr. V. Mohan (Consultant Diabetologist)
last_reviewed: 2026-11-12
chunk_strategy: hierarchical_by_header
max_chunk_tokens: 350
---
```

### Retrieval & Citation Requirements:
1. Every retrieved chunk MUST retain its `id`, `source_organization`, and `title`.
2. When the LLM generates a clinical response, it must embed inline bracketed citations referencing the Document ID (e.g., `[DOC-CLIN-01]`).
3. If no retrieved chunk exceeds the semantic relevance threshold ($\ge 0.65$ cosine similarity), the system triggers the **Safe No-Evidence Fallback**:
   > *"I don't have enough verified clinical information in my guidelines to answer this specific question. Please consult your physician or specialist for personalized guidance."*
