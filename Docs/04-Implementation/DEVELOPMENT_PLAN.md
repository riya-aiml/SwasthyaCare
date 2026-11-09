# Development Plan

Implementation starts only after the requirements and design baseline are approved.

## Proposed increments
1. Repository and engineering foundation: configuration, linting, formatting, CI, environment handling.
2. Identity and access: registration, login, roles, authorization, audit foundation.
3. Profiles and doctor directory.
4. Appointment request and doctor approval workflow.
5. Notifications: email/SMS adapters, job queue, retries, delivery records.
6. Post-discharge follow-up plans and recovery updates.
7. Heart and diabetes risk-assessment integration, only after data/model review.
8. Medicine packaging upload, OCR, reference matching, and inconclusive handling.
9. System hardening, accessibility, security, performance, and acceptance testing.
10. Deployment to a non-clinical demo environment using synthetic data.

## Definition of Done
A feature is done only when:
- Its requirement and acceptance criteria are clear.
- Code is reviewed and merged.
- Unit and relevant integration tests pass.
- Authorization and input validation are implemented.
- Errors are handled safely.
- Documentation/API contracts are updated.
- No secrets or real patient data are committed.
- The feature is demonstrated in the target environment.
