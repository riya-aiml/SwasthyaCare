# Use Case Catalogue

## Actors
- Patient
- Doctor / authorized clinician
- Administrator
- Hospital management
- External email provider
- External SMS provider
- ML/OCR service

## Use cases
| ID | Use case | Primary actor |
|---|---|---|
| UC-01 | Register / sign in | Patient |
| UC-02 | Manage profile | Patient |
| UC-03 | Search doctors and availability | Patient |
| UC-04 | Request appointment | Patient |
| UC-05 | Review appointment request | Doctor |
| UC-06 | Approve or reject appointment | Doctor |
| UC-07 | Manage availability | Doctor |
| UC-08 | Request appointment cancellation | Patient |
| UC-09 | Create discharge follow-up plan | Authorized clinician |
| UC-10 | Send follow-up reminders | System / email and SMS providers |
| UC-11 | Submit recovery update | Patient |
| UC-12 | Review recovery update | Authorized clinician |
| UC-13 | Complete heart-risk assessment | Patient |
| UC-14 | Complete diabetes-risk assessment | Patient |
| UC-15 | Review risk assessment | Authorized clinician |
| UC-16 | Upload medicine packaging image | Patient |
| UC-17 | View possible medicine matches | Patient |
| UC-18 | Manage accounts and roles | Administrator |
| UC-19 | View aggregate operational reports | Hospital management |

## Appointment use case: UC-04 Request appointment
**Primary actor:** Patient  
**Preconditions:** Patient is authenticated; doctor and slot information is available.  
**Trigger:** Patient chooses to request a slot.

### Main flow
1. Patient searches for a doctor.
2. System displays doctor profile and available slots.
3. Patient selects a doctor and slot.
4. Patient reviews and submits the request.
5. System validates eligibility and creates a pending request.
6. System makes the request visible to the selected doctor.
7. System notifies the patient that the request is pending.

### Alternate flows
- Slot is no longer available: system rejects the request and asks the patient to choose another slot.
- Required information is missing: system identifies the missing fields.
- Notification provider fails: request remains recorded; notification is queued for retry and failure is observable.

### Postconditions
A request exists with `PENDING` status, or the patient receives a clear validation/conflict response.

## Appointment use case: UC-06 Approve or reject appointment
**Primary actor:** Doctor  
**Preconditions:** Doctor is authenticated and authorized; request is pending and belongs to that doctor.  
**Main flow:** Doctor reviews request, selects approve or reject, and confirms the action. The system validates the current status, updates it, records the decision, and triggers patient notification.  
**Alternate flow:** If the slot conflicts with an existing confirmed appointment, approval is blocked and the doctor is asked to choose another action.  
**Postcondition:** Request is `APPROVED` or `REJECTED`, with actor and timestamp recorded.

## Follow-up use case: UC-09 Create follow-up plan
**Primary actor:** Authorized clinician  
**Preconditions:** Clinician is authorized to access the patient record.  
**Main flow:** Clinician selects a discharged patient, enters follow-up schedule and instructions, reviews the plan, and saves it. The system records the plan and schedules reminder jobs according to patient contact preferences and applicable consent.  
**Postcondition:** Follow-up plan is active and its reminder schedule is recorded.

## Medicine use case: UC-16 Upload packaging image
**Primary actor:** Patient  
**Preconditions:** Patient is authenticated and has permission to use the feature.  
**Main flow:** Patient uploads packaging/strip image; system validates file; OCR extracts text; matching service searches an approved reference source; system displays possible matches and uncertainty.  
**Alternate flow:** Image is unreadable or no reliable match exists; system returns an inconclusive result and recommends verification by a pharmacist or qualified professional.  
**Postcondition:** Upload and processing outcome are recorded according to retention policy.
