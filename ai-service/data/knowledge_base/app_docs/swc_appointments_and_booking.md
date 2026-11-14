---
id: DOC-PLAT-01
title: SwasthyaCare Doctor Discovery & Appointment Booking Workflows
category: platform_documentation
source_organization: SwasthyaCare Platform
version: 1.0.0
last_reviewed: 2026-11-12
---

# SwasthyaCare Doctor Discovery and Appointment Management

## 1. Doctor Discovery and Specialty Search
Patients can search for verified doctors by medical specialty (e.g., Cardiology, Diabetology, General Medicine, Neurology, Orthopedics) or physician name. Doctor profile cards show years of clinical experience, medical license numbers, consultation fees, and available days of practice.

## 2. Appointment Booking Mechanics
- **Slot Selection:** Patients choose an available date and time slot from the doctor's real-time schedule.
- **Booking Request Lifecycle:**
  - `PENDING`: The initial state when a patient requests an appointment slot.
  - `APPROVED`: The doctor or hospital reception confirms the consultation slot.
  - `COMPLETED`: Marked after clinical consultation concludes.
  - `CANCELLED`: Cancelled by either party with reason logged.
  - `REJECTED`: Slot unavailable or scheduling conflict.
- **Two-Step Confirmation Rule:** When interacting with the AI Assistant, appointment bookings or cancellations cannot be completed autonomously. The assistant generates a structured proposal card, requiring the patient to click "Confirm Booking" or "Confirm Cancellation" to execute the transaction.

## 3. Rescheduling and Cancellation Policies
- Patients can cancel or reschedule an appointment up to 24 hours prior to the scheduled consultation time through their patient dashboard.
- Within 24 hours of consultation, emergency cancellations must be routed through the hospital reception desk.
- Cancelled slots are immediately returned to the doctor's availability pool.
