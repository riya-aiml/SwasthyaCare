---
id: DOC-PLAT-02
title: SwasthyaCare Live OPD Digital Queue & Post-Discharge Follow-up Protocols
category: platform_documentation
source_organization: SwasthyaCare Platform
version: 1.0.0
last_reviewed: 2026-11-12
---

# Live OPD Digital Queue and Follow-up Protocols

## 1. Digital Token Queue Management
- **Token Generation:** When a patient arrives at the hospital for an approved appointment, the reception checks them in, issuing a dynamic digital token (e.g. `OPD-CVD-12`).
- **Real-Time Display:** The live patient dashboard displays the current token being served, number of patients ahead, and dynamic estimated wait time (typically 12–15 minutes per consultation).
- **SMS & In-App Alerts:** The system issues automated push alerts when the patient is second in line ("Next but one") to reduce physical waiting room crowding.

## 2. Post-Discharge Recovery Care Plans
- Following inpatient discharge or outpatient procedure, the attending clinician generates an automated recovery plan with defined milestones (Days 1, 3, 7, 14, and 30).
- Patients submit daily check-in recovery updates recording vital signs (blood pressure, temperature, pulse), pain scales (0–10), and medication adherence.
- **Automated Escalation Thresholds:**
  - Temperature $> 100.4^\circ\text{F}$ ($38^\circ\text{C}$) triggers an infection alert to the care team.
  - Systolic BP $> 160$ mmHg or Diastolic BP $> 100$ mmHg triggers a cardiovascular safety alert.
  - Severe pain ($> 7/10$) unresolved by prescribed analgesics triggers a doctor callback notification.
