# SwasthyaCare Application Knowledge: Live OPD Queue & Post-Discharge Care
**Document ID:** SWC-APP-02  
**Category:** queue_and_care  
**Target Scope:** Scope A (Application Help)  

## 1. Live OPD Queue Tracker & Dynamic Wait Estimates
* When a patient arrives at the clinic for a confirmed consultation, they are checked into the digital OPD Queue.
* The **Live Queue Status** tracker displays the patient's real-time queue position, estimated remaining wait time in minutes, and the doctor's current active consultation progress.
* Wait time estimates dynamically recalculate based on clinical consultation pacing.

## 2. Post-Discharge Care Protocols & Daily Check-Ins
* After an in-patient discharge or surgical consultation, clinicians create structured post-discharge care protocols under **Care & Recovery**.
* Care plans outline:
  * Primary diagnosis and surgical recovery notes.
  * Prescribed medication regimens (drug name, dosage, frequency, and duration).
  * Activity restrictions and dietary directives.
* Patients submit daily recovery check-ins, reporting their pain score (0-10 scale), mobility rating, and vital signs (blood pressure and resting heart rate).

## 3. Automated Warning Alerts & Clinician Triage
* If a patient reports acute warning symptoms (e.g. fever $> 101^\circ$F, excessive incision bleeding, unexpected severe pain, or spiking blood pressure), the check-in is instantly marked with a `NEEDS_ATTENTION` flag.
* This automatically elevates the patient into the doctor's **Critical Triage Queue** on the Physician Workbench, alerting clinical staff for prompt follow-up.
