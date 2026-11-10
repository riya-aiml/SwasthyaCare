# SwasthyaCare — Clinical Input Contracts & Biomarker Provenance Specification
## Task ML-S2-06: Traceability, Patient Confirmation & Data Governance

**Document ID:** SWC-ML-IC-001  
**Sprint:** Sprint 2 — Input Contracts, Safe Data Pipeline & Preprocessing  
**Parent Document:** `Docs/SwasthyaCare_ML_Sprint_Integration_v1.0.md`  
**Date:** 2026-11-10  
**Version:** 1.0.0  
**Status:** Approved Technical & Clinical Specification  

---

## 1. Overview & Regulatory Rationale

In high-stakes clinical and diagnostic decision support, machine learning models must not operate on unverified or unconfirmed data. Under FDA Software as a Medical Device (SaMD) guidance and Good Machine Learning Practice (GMLP), the provenance (origin, lineage, and confirmation status) of every biomarker must be recorded alongside inference requests and persisted in immutable audit logs.

### Primary Objectives
1. **Source Attribution:** Differentiate between direct patient manual input, automated OCR/vision document extraction, and EHR clinical import.
2. **Explicit Human Confirmation:** Enforce an intentional human review step before high-impact ML models are invoked.
3. **Temporal Lineage:** Record UTC timestamps to establish chronological ordering relative to clinical encounters.
4. **Audit Trail Persistence:** Guarantee that the Node.js Express Gateway and MongoDB `riskAssessments` store full input provenance with zero telemetry leakage.

---

## 2. Provenance Data Contract Schema

Every assessment request submitted to the SwasthyaCare AI microservice embeds an `AssessmentProvenance` block:

```json
{
  "schema_version": "v1.0.0",
  "provenance": {
    "source": "manual_entry | ocr_extraction | clinical_ehr_import",
    "patient_confirmed": true,
    "entered_at": "2026-11-10T10:00:00.000Z"
  }
}
```

### 2.1 Field Definitions & Permitted Values

| Field Name | Type | Permitted Values | Validation Rules | Description |
|---|---|---|---|---|
| `source` | `String (Enum)` | `'manual_entry'`, `'ocr_extraction'`, `'clinical_ehr_import'` | Must match enum strictly | Identifies the physical entry channel of the biomarker values. |
| `patient_confirmed` | `Boolean` | `true`, `false` | Must evaluate to boolean | Indicates whether the patient or attending clinician explicitly reviewed and confirmed the numerical values on screen. |
| `entered_at` | `String (ISO 8601)` | Valid UTC timestamp regex | Auto-populated by client or gateway if omitted | Timestamp representing when the values were captured or confirmed. |

---

## 3. Human Confirmation Policy per Input Source

### 3.1 Manual Patient Entry (`source: "manual_entry"`)
* **Workflow:** The patient fills in the questionnaire or biomarker input fields within the SwasthyaCare React portal.
* **Confirmation Step:** Before the "Run Assessment" button is enabled, a review card displays all entered numbers with their physiological units (e.g., *Resting BP: 125 mmHg*, *BMI: 24.5 kg/m²*).
* **Patient Checkbox:**  
  `[x] "I confirm that these values accurately reflect my health metrics or recent medical tests."`
* **Enforcement:** If `patient_confirmed` is `false`, the Express Gateway rejects the assessment with HTTP 400 Bad Request.

### 3.2 OCR Extraction (`source: "ocr_extraction"`)
* **Workflow:** The user uploads a lab report, blood test, or prescription image processed by SwasthyaCare's OCR pipeline (Sprint 6).
* **Confidence Gate:**
  * When OCR token confidence is $\ge 85\%$ and within plausible physiological bounds, extracted fields are pre-filled into the assessment form.
  * When OCR token confidence is $< 85\%$ or values require unit conversion (e.g., fasting glucose in mmol/L converted to mg/dL), fields are highlighted with an amber border.
* **Mandatory Verification Gate:**  
  The system **never** triggers ML model inference directly from raw OCR output. The user MUST inspect the pre-filled form, correct any misread digits, and click **"Verify and Run Assessment"** (`patient_confirmed: true`).

### 3.3 Clinical EHR Import (`source: "clinical_ehr_import"`)
* **Workflow:** Vitals and lab measurements imported directly from hospital FHIR / HL7 records or verified doctor consultation notes.
* **Doctor Attestation:** The attending doctor or nurse reviews the imported vitals prior to executing risk scoring. `patient_confirmed` is marked `true` under clinician authorization.

---

## 4. Gateway & Microservice Provenance Handshake

```
[ React SPA ]
   │  Submits payload with { source, patient_confirmed: true }
   ▼
[ Express Gateway (Port 3001) ]
   │  1. Verifies authenticateJWT() & user role
   │  2. Validates patient_confirmed === true
   │  3. Forwards internal RPC to FastAPI:8000
   ▼
[ Python FastAPI (Port 8000) ]
   │  1. Validates Pydantic schema (ranges, types, provenance)
   │  2. Transforms via ColumnTransformer
   │  3. Computes probability & approved non-diagnostic label
   │  4. Returns response with provenance preserved
   ▼
[ Express Gateway (Port 3001) ]
   │  Logs to MongoDB `riskAssessments`:
   │  {
   │    patientId: "usr_...",
   │    taskId: "ML-DIA-01",
   │    provenance: { source, patient_confirmed, entered_at },
   │    prediction: 0,
   │    probability: 0.14,
   │    createdAt: ISODate()
   │  }
   ▼
[ React SPA Dashboard ]
   Displays result with audit tag: "Verified by Patient • Manual Entry"
```

---

## 5. Security & Tamper Prevention
1. **Server-Side Timestamping:** If the client provides a skewed timestamp ($>5$ minutes difference from server time), the Express Gateway overrides `entered_at` with the canonical server UTC time.
2. **Replay Protection:** Unique request tokens prevent duplicate identical submissions within a 60-second window.
3. **Data Anonymization in Telemetry:** Telemetry loggers extract only model execution latency and response status; raw biomarker values and patient IDs are excluded from application error logs.

---
*Signed off for Sprint 2 — Task ML-S2-06.*
