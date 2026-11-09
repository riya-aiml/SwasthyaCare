# Database Design – Initial Conceptual Model

**Status:** Conceptual only. Final database choice and schema are TBD.

## 1. Candidate entities
- User
- PatientProfile
- DoctorProfile
- Appointment
- DoctorAvailability
- DischargeRecord
- FollowUpPlan
- RecoveryUpdate
- Reminder
- RiskAssessment
- MedicineImageUpload
- MedicineMatch
- AuditEvent

## 2. Conceptual relationships

```mermaid
erDiagram
    USER ||--o| PATIENT_PROFILE : has
    USER ||--o| DOCTOR_PROFILE : has
    PATIENT_PROFILE ||--o{ APPOINTMENT : requests
    DOCTOR_PROFILE ||--o{ APPOINTMENT : receives
    DOCTOR_PROFILE ||--o{ DOCTOR_AVAILABILITY : defines
    PATIENT_PROFILE ||--o{ DISCHARGE_RECORD : has
    DISCHARGE_RECORD ||--o{ FOLLOW_UP_PLAN : leads_to
    FOLLOW_UP_PLAN ||--o{ RECOVERY_UPDATE : receives
    FOLLOW_UP_PLAN ||--o{ REMINDER : schedules
    PATIENT_PROFILE ||--o{ RISK_ASSESSMENT : completes
    PATIENT_PROFILE ||--o{ MEDICINE_IMAGE_UPLOAD : submits
    MEDICINE_IMAGE_UPLOAD ||--o{ MEDICINE_MATCH : produces
    USER ||--o{ AUDIT_EVENT : performs
```

## 3. Important design notes
- Store role and permission information so that a user cannot grant themselves privileges.
- Use stable identifiers and timestamps.
- Keep uploaded image binaries in private object storage rather than directly in ordinary profile documents.
- Store model name/version and assessment timestamp with each risk result.
- Record the source and version/date of medicine reference data used for matching.
- Minimize collected health data; define purpose, retention, deletion, and access rules.
- Do not expose patient records to hospital management by default; aggregate-only access is the provisional privacy-preserving assumption pending approval.

## 4. Schema details to decide
- MongoDB versus PostgreSQL.
- Whether a patient may have multiple simultaneous pending appointment requests.
- Whether one appointment can involve more than one clinician.
- Hospital/clinic tenancy model.
- Retention and deletion rules.
- Consent and contact preference representation.
