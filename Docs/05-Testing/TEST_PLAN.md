# Test Plan

## 1. Objectives
Verify functional correctness, access control, privacy safeguards, reliability, usability, and safe handling of uncertain AI/OCR outputs.

## 2. Test levels
- Unit testing: individual functions and components.
- Integration testing: API, database, notification, and ML/OCR interfaces.
- System testing: end-to-end user workflows.
- Security testing: authentication, authorization, upload validation, and data exposure.
- Acceptance testing: representative users review agreed acceptance criteria.

## 3. Test data
Use synthetic or properly de-identified data. Do not use real patient data in ordinary development or test environments.

## 4. Initial test cases
| ID | Scenario | Expected result |
|---|---|---|
| TC-AUTH-001 | Patient registers with valid details | Account created |
| TC-SEC-001 | Patient requests another patient's record | Access denied and event audited |
| TC-APT-001 | Patient views doctor slots | Only eligible slots shown |
| TC-APT-002 | Patient requests valid slot | Request created as PENDING |
| TC-APT-003 | Authorized doctor approves pending request | Status becomes APPROVED if slot remains valid |
| TC-APT-004 | Two requests race for same doctor/time | No conflicting confirmed appointments |
| TC-APT-005 | Unauthorized user approves request | Access denied |
| TC-FUP-001 | Authorized clinician creates follow-up plan | Plan saved and audit event recorded |
| TC-FUP-002 | Reminder provider temporarily fails | Retry/failure state recorded; plan remains |
| TC-FUP-003 | Patient submits recovery update | Update visible only to authorized users |
| TC-RISK-001 | Valid heart assessment input | Versioned result with limitations returned |
| TC-RISK-002 | Invalid or missing model input | Validation error; no misleading result |
| TC-MED-001 | Blurry/unreadable packaging image | Inconclusive result; no unsafe recommendation |
| TC-MED-002 | Unsupported or oversized upload | Upload rejected safely |
| TC-ADMIN-001 | Admin changes a role | Permission check and audit event applied |

## 5. Release exit criteria
- All must-have acceptance tests pass.
- No unresolved critical/high security defects.
- Appointment concurrency tests pass.
- Sensitive data access tests pass.
- Model/OCR limitations are communicated.
- Backup and recovery process is tested for the target environment.
- Product owner approves the release.
