# Architecture and Product Decision Log

Open decisions must be resolved before the design is baselined.

| ID | Decision | Current status / proposal |
|---|---|---|
| ADR-001 | Appointment booking approval | Decided: doctor approval required |
| ADR-002 | Follow-up reminders | Decided: email and SMS |
| ADR-003 | Medicine image type | Decided: packaging or strip |
| ADR-004 | Patient appointment concurrency | TBD: can a patient hold multiple pending requests at once? |
| ADR-005 | Follow-up plan creation | Proposal: authorized clinician creates plan; confirm whether admin may also do so |
| ADR-006 | Hospital management access | Privacy-preserving proposal: aggregate reports only; confirm |
| ADR-007 | Database | TBD: MongoDB proposed; compare with PostgreSQL based on transactional and relational needs |
| ADR-008 | Appointment slot reservation | TBD: whether pending requests temporarily hold a slot and for how long |
| ADR-009 | Email/SMS providers | TBD |
| ADR-010 | Medicine reference source | TBD; must be trustworthy and maintained |
| ADR-011 | Risk-assessment datasets/models | TBD; require documented evaluation and clinical review |
| ADR-012 | Hosting and object storage | TBD |
| ADR-013 | Retention and deletion | TBD; privacy/legal review required |

## Decision record template
For each decision, document:
- Context and problem.
- Options considered.
- Decision.
- Reasons and trade-offs.
- Security/privacy impact.
- Date and approver.
