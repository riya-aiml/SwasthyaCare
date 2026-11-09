# Project Charter

**Document ID:** SC-PLN-001  
**Version:** 0.1  
**Status:** Draft for review

## 1. Project overview
SwasthyaCare is an AI-assisted healthcare management platform intended to improve selected patient and hospital workflows.

## 2. Problem statement
Healthcare workflows can be fragmented across appointment scheduling, post-discharge follow-up, access to preliminary health-risk information, and identification of medicine packaging. SwasthyaCare aims to provide a unified digital platform to support these workflows.

This statement describes the problem the product intends to address; it is not a claim that every healthcare facility currently experiences all of these problems.

## 3. Objectives
1. Provide a doctor-reviewed appointment request and approval workflow.
2. Support structured post-discharge follow-up plans and patient recovery updates.
3. Provide preliminary heart disease and diabetes risk estimates using appropriately evaluated models.
4. Help users extract and match information from medicine packaging images.
5. Provide role-appropriate access for patients, doctors, administrators, and hospital management.

## 4. Stakeholders
- Patients
- Doctors / authorized clinicians
- Platform administrators
- Hospital management
- Development and operations team

## 5. Proposed initial release
The initial release is intended to demonstrate:
- Account access and role-based permissions.
- Patient and doctor profiles.
- Appointment requests, doctor approval/rejection, and notifications.
- Post-discharge follow-up plans, recovery updates, and email/SMS reminders.
- Preliminary heart disease and diabetes risk assessment.
- Medicine-packaging image upload, OCR, possible matching, and uncertainty handling.

## 6. Success criteria (to be baselined)
- A patient can submit an appointment request and see its status.
- An authorized doctor can approve or reject a request.
- The system prevents two confirmed appointments from occupying the same doctor/time slot.
- An authorized clinician can create a follow-up plan and the patient can submit an update.
- Reminder delivery attempts and failures are recorded.
- Risk-assessment outputs show limitations and are not presented as diagnoses.
- Medicine identification returns possible matches or an explicit inconclusive result.
- Role-based access and audit logging are tested.

Quantitative targets (latency, uptime, model performance, reminder delivery rate) are **TBD** and must be set before acceptance testing.

## 7. Constraints and assumptions
- Initial development is a student/portfolio project.
- Synthetic or properly de-identified data will be used during development.
- No real clinical deployment is authorized by this charter.
- Technology choices remain provisional pending architecture review.
- External email, SMS, OCR, and data services may have cost, availability, and privacy constraints.

## 8. Key risks
- Inadequate or biased training/validation data.
- Incorrect medicine matches from poor-quality or similar packaging.
- Exposure of sensitive health information.
- Appointment race conditions and duplicate bookings.
- Unreliable third-party email/SMS delivery.
- Scope expansion beyond available time and resources.

## 9. Approval
| Role | Name | Status |
|---|---|---|
| Product owner | TBD | Pending |
| Technical lead | TBD | Pending |
| Clinical reviewer (if applicable) | TBD | Pending |
