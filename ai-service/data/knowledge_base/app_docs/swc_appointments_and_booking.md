# SwasthyaCare Application Knowledge: Appointments & Doctor Scheduling
**Document ID:** SWC-APP-01  
**Category:** appointments  
**Target Scope:** Scope A (Application Help)  

## 1. Booking a Specialist Consultation
* Patients can browse all approved medical specialists in the **Find Specialists** directory.
* Each doctor profile displays their clinical specialty (e.g. Cardiology, Endocrinology, General Medicine), hospital affiliation, consultation fee, and available consultation types (In-Person Clinic Visit or Video Consultation).
* To book an appointment, select an available date and time slot from the doctor's published availability schedule.

## 2. High-Concurrency Slot Locking & Atomic Reservation
* SwasthyaCare employs an atomic Compare-And-Swap (CAS) locking mechanism to prevent double-booking.
* When a patient requests a slot, the system immediately places a temporary reservation lock. If another patient attempts to book the exact same slot concurrently, the second request receives an immediate notification stating the slot is no longer available.
* All new appointments enter a `PENDING` triage status awaiting clinician review.

## 3. Clinician Approval & Appointment Confirmation
* Treating clinicians review consultation requests in their **Physician Workbench / Triage Queue**.
* Once the doctor approves the appointment, the slot status transitions to `CONFIRMED`, and the patient receives a confirmed booking notification on their dashboard and notification ledger.
* If a doctor has an emergency surgery or scheduling conflict, they may decline the request with an explicit clinical reason, and the slot is immediately released.

## 4. Cancellation & Rescheduling Protocols
* Patients can review and cancel their upcoming appointments in the **My Appointments** ledger.
* Cancelling an appointment automatically releases the slot back to the doctor's bookable availability schedule so other patients can access care.
