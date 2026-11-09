# Software Requirements Specification (SRS)

**Document ID:** SC-REQ-001  
**Version:** 0.1  
**Status:** Draft baseline for review  
**Product:** SwasthyaCare

## 1. Introduction

### 1.1 Purpose
This SRS defines the proposed functional and non-functional requirements for the SwasthyaCare MVP. It is intended for product, design, development, testing, and review.

### 1.2 Product scope
SwasthyaCare supports appointment management, post-discharge follow-up, preliminary heart disease and diabetes risk assessment, and medicine-packaging image identification.

### 1.3 Definitions
- **Patient:** A person using the platform to manage appointments and access permitted health-related features.
- **Doctor/clinician:** An authorized healthcare professional using the platform.
- **Administrator:** A user responsible for platform account and operational administration.
- **Hospital management:** A stakeholder who views permitted operational and aggregate information.
- **Risk estimate:** A model output that may support further review; it is not a diagnosis.
- **Medicine match:** A possible match based on packaging information; it is not confirmation that a product is safe or appropriate to use.

## 2. User classes
1. Patient
2. Doctor / authorized clinician
3. Platform administrator
4. Hospital management

Access must be permission-based. A role name alone must not grant unrestricted access to patient records.

## 3. Functional requirements

### 3.1 Authentication and profiles
- **FR-001:** The system shall allow patients to register.
- **FR-002:** The system shall authenticate users before access to protected features.
- **FR-003:** The system shall enforce role- and permission-based authorization.
- **FR-004:** The system shall allow users to log out.
- **FR-005:** The system shall allow users to view and update permitted profile fields.
- **FR-006:** The system shall allow administrators to manage accounts and roles subject to authorization and audit logging.

### 3.2 Appointment management
- **FR-007:** Patients shall be able to search or browse available doctors.
- **FR-008:** Patients shall be able to view appointment slots offered by a doctor.
- **FR-009:** Patients shall be able to submit an appointment request for a selected doctor and slot.
- **FR-010:** A submitted request shall initially have a `PENDING` status.
- **FR-011:** An authorized doctor shall be able to view appointment requests addressed to that doctor.
- **FR-012:** An authorized doctor shall be able to approve or reject a pending request.
- **FR-013:** The system shall notify the patient when the request status changes.
- **FR-014:** Patients shall be able to request cancellation, subject to configured policy.
- **FR-015:** Doctors shall be able to manage their availability.
- **FR-016:** The system shall prevent overlapping confirmed appointments for the same doctor.
- **FR-017:** The system shall record appointment status changes and relevant timestamps.
- **FR-018:** The system shall handle simultaneous requests for the same slot without creating conflicting confirmed appointments.

### 3.3 Post-discharge follow-up
- **FR-019:** An authorized clinician shall be able to create a follow-up plan for a patient after discharge.
- **FR-020:** A follow-up plan shall support due dates, instructions, and status.
- **FR-021:** The system shall schedule email reminders for follow-up events.
- **FR-022:** The system shall schedule SMS reminders for follow-up events.
- **FR-023:** The system shall record reminder attempts and delivery-provider responses where available.
- **FR-024:** Patients shall be able to submit recovery updates through the platform.
- **FR-025:** Authorized clinicians shall be able to review recovery updates.
- **FR-026:** The system shall maintain follow-up history with access controls.

### 3.4 Risk assessment
- **FR-027:** The system shall collect the defined input fields for heart disease risk assessment.
- **FR-028:** The system shall produce a preliminary heart disease risk estimate using an approved model version.
- **FR-029:** The system shall collect the defined input fields for diabetes risk assessment.
- **FR-030:** The system shall produce a preliminary diabetes risk estimate using an approved model version.
- **FR-031:** The system shall display the result, relevant explanation, model/version information, and limitations.
- **FR-032:** Authorized clinicians shall be able to review permitted assessment results.
- **FR-033:** The system shall store assessment history only under the approved retention and access policy.
- **FR-034:** The system shall not describe a model output as a confirmed diagnosis or use it to autonomously prescribe treatment.

### 3.5 Medicine packaging identification
- **FR-035:** Users shall be able to upload an image of medicine packaging or a strip.
- **FR-036:** The system shall validate file type, size, and basic image properties.
- **FR-037:** The system shall process the image using an OCR/image-processing workflow.
- **FR-038:** The system shall return possible medicine matches from an approved reference source, when available.
- **FR-039:** The system shall display the extracted identifying details and matching uncertainty.
- **FR-040:** The system shall return an explicit inconclusive result when the image or evidence is insufficient.
- **FR-041:** The system shall advise users to verify the product with a pharmacist or qualified healthcare professional.
- **FR-042:** The system shall not tell users to take, stop, or change a medicine based solely on an image match.

### 3.6 Notifications and audit
- **FR-043:** The system shall create notifications for relevant appointment and follow-up events.
- **FR-044:** The system shall record security-relevant events and sensitive record access.
- **FR-045:** The system shall avoid writing passwords, authentication tokens, or unnecessary health details to logs.

## 4. Non-functional requirements
- **NFR-001 Security:** Protected functions shall require authentication and authorization.
- **NFR-002 Privacy:** Health information shall only be processed for documented, authorized purposes.
- **NFR-003 Transport security:** Network traffic containing sensitive information shall use HTTPS/TLS.
- **NFR-004 Data protection:** Sensitive stored information shall receive appropriate encryption, access controls, backups, and key management.
- **NFR-005 Reliability:** Appointment confirmation logic shall prevent conflicting confirmed bookings under concurrent requests.
- **NFR-006 Usability:** Core patient and clinician workflows shall be responsive and usable on common mobile and desktop screen sizes.
- **NFR-007 Maintainability:** Backend modules and external integrations shall have clear boundaries and documented interfaces.
- **NFR-008 Observability:** Errors and important operational events shall be logged without exposing secrets or unnecessary patient information.
- **NFR-009 Accessibility:** Interfaces should follow recognized accessibility practices, including keyboard operation, labels, and sufficient contrast.
- **NFR-010 Clinical safety:** Risk and medicine outputs shall communicate uncertainty and limitations and shall not substitute for professional judgement.

## 5. External interface requirements
- Browser-based React user interface.
- REST API between frontend and backend.
- Backend-to-ML/OCR service interface, likely HTTP/JSON.
- Email and SMS provider interfaces, providers TBD.
- Approved medicine reference source, TBD.

## 6. Assumptions and dependencies
- The initial build uses synthetic or de-identified data.
- A clinician-reviewed definition of follow-up workflow will be required.
- Validated and suitable datasets/models must be selected before risk-assessment acceptance.
- A trusted medicine reference source must be identified before medicine matching can be considered reliable.
- Email/SMS provider availability, pricing, and consent requirements must be reviewed.

## 7. Open questions
See `../03-System-Design/DECISION_LOG.md`. Open decisions must be resolved before the design is baselined.

## 8. Acceptance
This SRS becomes baselined only after the product owner and technical lead review the requirements, resolve priority and scope, and approve the open decisions.
