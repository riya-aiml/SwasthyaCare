# User Stories

Format: **As a [role], I want [capability], so that [benefit].**

| ID | User story | Priority |
|---|---|---|
| US-001 | As a patient, I want to register so that I can access permitted platform features. | Must |
| US-002 | As a user, I want to log in and out securely so that my account is protected. | Must |
| US-003 | As a patient, I want to manage my profile so that my information is current. | Must |
| US-004 | As a patient, I want to find doctors so that I can choose whom to request an appointment with. | Must |
| US-005 | As a patient, I want to view available slots so that I can request a suitable time. | Must |
| US-006 | As a patient, I want to request an appointment so that a doctor can review it. | Must |
| US-007 | As a doctor, I want to review pending requests so that I can decide whether to approve or reject them. | Must |
| US-008 | As a patient, I want to see the appointment decision so that I know its status. | Must |
| US-009 | As a doctor, I want to manage my availability so that patients can request appropriate slots. | Must |
| US-010 | As a patient, I want to request cancellation so that I can manage a change in plans. | Should |
| US-011 | As an authorized clinician, I want to create a discharge follow-up plan so that continuity of care can be supported. | Must |
| US-012 | As a patient, I want to receive email and SMS reminders so that I can remember follow-up actions. | Must |
| US-013 | As a patient, I want to submit a recovery update so that my care team can review it. | Must |
| US-014 | As a clinician, I want to review recovery updates so that I can decide whether follow-up is needed. | Must |
| US-015 | As a patient, I want to complete a heart-risk questionnaire so that I can view a preliminary risk estimate. | Must |
| US-016 | As a patient, I want to complete a diabetes-risk questionnaire so that I can view a preliminary risk estimate. | Must |
| US-017 | As a clinician, I want to review permitted risk-assessment results so that they can inform further evaluation. | Should |
| US-018 | As a patient, I want to upload medicine packaging so that the system can extract identifying information. | Must |
| US-019 | As a patient, I want to see possible medicine matches and uncertainty so that I can seek verification. | Must |
| US-020 | As an administrator, I want to manage accounts and roles so that platform access is controlled. | Must |
| US-021 | As hospital management, I want aggregate operational reports so that I can monitor service activity. | Should |

## Example acceptance criteria: US-006
- Given an authenticated patient, when they select a doctor and an available slot, then they can submit an appointment request.
- The request is stored with `PENDING` status.
- The patient can see the request in their appointment history.
- The system does not show the request as confirmed until an authorized doctor approves it.
- If the slot is no longer eligible, the system explains the conflict and asks the patient to select another slot.
