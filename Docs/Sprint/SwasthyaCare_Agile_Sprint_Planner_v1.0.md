# SwasthyaCare — Agile Sprint Planner

**Document ID:** SWC-SP-001  
**Version:** 1.0  
**Status:** Proposed implementation baseline  
**Database decision:** MongoDB selected  
**Planning model:** Agile Scrum with incremental delivery  
**Sprint duration:** 2 weeks  
**Planned roadmap:** 8 sprints / approximately 16 weeks  
**Project:** SwasthyaCare — Healthcare Assistance and Patient Risk Assessment System

---

## 1. Purpose

This sprint planner converts the SwasthyaCare requirements and System Design Review (SDR) into an actionable implementation roadmap.

It defines:

- Sprint goals and deliverables.
- Prioritized product backlog.
- Tasks, dependencies, and acceptance criteria.
- Definition of Ready and Definition of Done.
- Testing and review expectations.
- MongoDB implementation direction.
- Suggested repository structure.
- The exact work to begin in Sprint 1.

This is a planning baseline. Sprint scope can be adjusted after each review, but changes must be recorded in the backlog and decision log.

## 2. Confirmed project decisions

| Area | Decision |
|---|---|
| SDLC model | Agile Scrum with incremental development |
| Database | **MongoDB** |
| Frontend | React |
| Main backend | Node.js + Express |
| ML/OCR service | Python + FastAPI |
| Appointment approval | Doctor approval required |
| Follow-up reminders | Email and SMS |
| Follow-up plans | Yes; created by authorized clinicians |
| Medicine image input | Packaging / medicine strip |
| Initial risk assessment | Heart disease and diabetes |
| Main user roles | Patient, Doctor, Admin, Hospital Management |
| Development/demo data | Synthetic or properly de-identified data |

### Important design note

MongoDB is selected for the project. We will use a documented collection design, schema validation, indexes, and transaction/concurrency safeguards where needed. Appointment booking must not depend on a frontend-only availability check.

The hospital-management role will default to aggregate-only reporting until individual-record access is explicitly justified and approved.

## 3. Proposed 16-week roadmap

| Sprint | Duration | Goal | Main deliverable |
|---|---|---|---|
| Sprint 1 | Weeks 1–2 | Foundation and developer setup | Running frontend/backend, MongoDB connection, health endpoint |
| Sprint 2 | Weeks 3–4 | Authentication and user profiles | Secure registration/login and role-based access |
| Sprint 3 | Weeks 5–6 | Doctor discovery and availability | Doctor directory and availability management |
| Sprint 4 | Weeks 7–8 | Appointment lifecycle | Patient request, doctor approval/rejection, status notifications |
| Sprint 5 | Weeks 9–10 | Post-discharge follow-up | Follow-up plans, recovery updates, reminder job foundation |
| Sprint 6 | Weeks 11–12 | Risk assessment and medicine OCR prototypes | FastAPI service, synthetic-data risk workflow, packaging OCR prototype |
| Sprint 7 | Weeks 13–14 | Dashboards and integration | Role-specific dashboards and integrated workflows |
| Sprint 8 | Weeks 15–16 | Quality, security and deployment | Tested demonstration release and project documentation |

The schedule is a planning estimate, not a guarantee. A sprint may be extended if its acceptance criteria are not met.

---

# 4. Detailed sprint plans

## Sprint 1 — Project foundation

**Duration:** 2 weeks  
**Priority:** Critical  
**Sprint goal:** Create a clean, reproducible development environment and establish communication between the frontend, backend, and MongoDB.

### Tasks

| ID | Task | Priority | Expected result |
|---|---|---|---|
| S1-01 | Create Git repository | Must | Repository initialized with README and .gitignore |
| S1-02 | Create React frontend using Vite | Must | Frontend runs locally |
| S1-03 | Create Node.js + Express backend | Must | Backend runs locally |
| S1-04 | Configure environment variables | Must | Secrets and configuration are not committed |
| S1-05 | Connect backend to MongoDB | Must | Successful database connection |
| S1-06 | Add API health endpoint | Must | `GET /api/health` returns service status |
| S1-07 | Configure frontend API client | Should | Frontend can call backend |
| S1-08 | Add centralized error handling | Should | Consistent API error response |
| S1-09 | Add linting and formatting | Should | Consistent code style |
| S1-10 | Write setup documentation | Must | Another developer can run the project |

### Acceptance criteria

- Frontend starts successfully.
- Backend starts successfully.
- Backend connects to the selected MongoDB environment.
- `GET /api/health` returns a successful response.
- Frontend can display backend health status.
- `.env` files are excluded from Git.
- A fresh clone can be configured using documented steps.

### Sprint 1 deliverable

A working application skeleton with React, Express, and MongoDB connected.

---

## Sprint 2 — Authentication and user profiles

**Duration:** 2 weeks  
**Sprint goal:** Allow users to register and log in securely, with server-side role enforcement.

### Tasks

| ID | Task | Priority | Expected result |
|---|---|---|---|
| S2-01 | Define user model and validation | Must | User schema and validation rules |
| S2-02 | Implement patient registration | Must | Patient can create an account |
| S2-03 | Implement login | Must | Valid credentials authenticate |
| S2-04 | Hash passwords | Must | Plaintext passwords are never stored |
| S2-05 | Implement logout/session invalidation | Must | Logout invalidates the active session/token |
| S2-06 | Add authentication middleware | Must | Protected APIs reject unauthenticated users |
| S2-07 | Add role-based authorization middleware | Must | Role restrictions enforced by backend |
| S2-08 | Create patient profile APIs | Must | Patient can view/update permitted profile fields |
| S2-09 | Build login and registration UI | Must | Working authentication screens |
| S2-10 | Add authentication tests | Must | Positive and negative tests pass |

### Acceptance criteria

- Duplicate accounts are rejected according to the chosen unique identifier.
- Passwords are hashed using a suitable password-hashing algorithm.
- Invalid credentials return a safe error.
- Protected endpoints reject unauthenticated requests.
- A patient cannot access another patient's profile by changing an ID.
- Admin-only actions are not available to patient accounts.
- Sensitive data is not returned unnecessarily.

### Sprint 2 deliverable

Secure registration, login, logout, patient profiles, and a first version of role-based access control.

---

## Sprint 3 — Doctor discovery and availability

**Duration:** 2 weeks  
**Sprint goal:** Allow patients to discover doctors and view available appointment slots.

### Tasks

| ID | Task | Priority | Expected result |
|---|---|---|---|
| S3-01 | Define doctor profile model | Must | Doctor data structure |
| S3-02 | Define doctor availability model | Must | Availability slots stored |
| S3-03 | Implement doctor profile APIs | Must | Authorized doctor profile management |
| S3-04 | Implement doctor directory API | Must | Patient can search/list doctors |
| S3-05 | Implement availability creation/update | Must | Doctor manages availability |
| S3-06 | Implement slot listing API | Must | Patient sees bookable slots |
| S3-07 | Build doctor directory UI | Must | Search and doctor listing |
| S3-08 | Build doctor profile UI | Should | Doctor details displayed |
| S3-09 | Build availability management UI | Must | Doctor can manage slots |
| S3-10 | Add authorization and validation tests | Must | Role and input checks pass |

### Acceptance criteria

- Patients can view approved doctor profiles.
- Doctors can manage only their own availability.
- Patients cannot modify doctor availability.
- Invalid, past, or conflicting slots are rejected according to the approved policy.
- Time zone handling is documented and consistent.
- Only authorized users can access protected doctor-management APIs.

### Sprint 3 deliverable

Doctor directory, doctor profiles, and availability management.

---

## Sprint 4 — Appointment management

**Duration:** 2 weeks  
**Sprint goal:** Complete the patient appointment request and doctor approval workflow.

### Tasks

| ID | Task | Priority | Expected result |
|---|---|---|---|
| S4-01 | Finalize appointment state machine | Must | Allowed transitions documented |
| S4-02 | Define appointment model | Must | Appointment documents and indexes |
| S4-03 | Implement appointment request API | Must | Patient creates pending request |
| S4-04 | Implement doctor pending-request view | Must | Doctor sees requests assigned to them |
| S4-05 | Implement approve/reject API | Must | Doctor decides on request |
| S4-06 | Implement cancellation | Should | Authorized cancellation |
| S4-07 | Add double-booking protection | Must | Conflicting approvals prevented |
| S4-08 | Add appointment history API | Must | Patient and doctor see permitted history |
| S4-09 | Build patient appointment UI | Must | Request and track appointments |
| S4-10 | Build doctor request-management UI | Must | Approve/reject requests |
| S4-11 | Add appointment workflow tests | Must | State and concurrency tests pass |

### Proposed appointment statuses

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`
- `NO_SHOW`

### Acceptance criteria

- A patient can request an available slot.
- New requests begin as `PENDING`.
- Only the assigned doctor or another explicitly authorized role can approve/reject.
- Invalid state transitions are rejected.
- Two requests cannot both become approved for the same exclusive doctor slot.
- Every decision records actor and timestamp.
- Patient and doctor see only records permitted to them.

### Open policy to confirm before implementation

- Can a patient have more than one pending request at a time?
- Does a pending request temporarily hold the slot? If yes, for how long?
- What is the cancellation cutoff?

### Sprint 4 deliverable

A complete appointment request, review, approval/rejection, and history workflow.

---

## Sprint 5 — Post-discharge follow-up

**Duration:** 2 weeks  
**Sprint goal:** Let authorized clinicians create follow-up plans and patients submit recovery updates, with a reliable reminder foundation.

### Tasks

| ID | Task | Priority | Expected result |
|---|---|---|---|
| S5-01 | Define follow-up plan model | Must | Follow-up schema |
| S5-02 | Define recovery update model | Must | Recovery update schema |
| S5-03 | Implement clinician plan creation | Must | Authorized clinician creates plan |
| S5-04 | Implement patient follow-up view | Must | Patient sees own plan |
| S5-05 | Implement recovery update API | Must | Patient submits update |
| S5-06 | Implement clinician review API | Must | Clinician reviews permitted updates |
| S5-07 | Design notification job model | Must | Scheduled job state and retry metadata |
| S5-08 | Implement email adapter | Should | Email provider integration boundary |
| S5-09 | Implement SMS adapter | Should | SMS provider integration boundary |
| S5-10 | Add reminder scheduling worker | Must | Due reminders are processed |
| S5-11 | Add delivery/retry tests | Must | Failures and duplicate jobs handled |

### Acceptance criteria

- Only authorized clinicians can create follow-up plans.
- Patients can access only their own follow-up information.
- Patients can submit recovery updates.
- Authorized clinicians can review updates.
- Reminder jobs record status, attempt count, and timestamps.
- Retry logic does not create uncontrolled duplicate notifications.
- Message content avoids unnecessary sensitive medical details.
- Provider credentials are stored securely.

### Sprint 5 deliverable

Follow-up plans, patient recovery updates, clinician review, and reminder-processing foundation.

---

## Sprint 6 — Risk assessment and medicine-package OCR prototypes

**Duration:** 2 weeks  
**Sprint goal:** Establish the Python service boundary and create safe, clearly labeled prototypes for the two intelligent features.

### Tasks

| ID | Task | Priority | Expected result |
|---|---|---|---|
| S6-01 | Create Python FastAPI service | Must | Service starts independently |
| S6-02 | Define service request/response contracts | Must | Versioned schemas documented |
| S6-03 | Create synthetic test data | Must | No real identifiable patient data |
| S6-04 | Build heart-risk inference prototype | Must | Prototype response with limitations |
| S6-05 | Build diabetes-risk inference prototype | Must | Prototype response with limitations |
| S6-06 | Record model version and timestamp | Must | Output traceability |
| S6-07 | Add input validation and range checks | Must | Invalid inputs rejected |
| S6-08 | Add image upload endpoint | Must | Authorized image upload |
| S6-09 | Add private image storage adapter | Must | No public image exposure |
| S6-10 | Integrate OCR library/prototype | Should | Text extracted from sample packaging |
| S6-11 | Add candidate matching boundary | Should | Possible matches or inconclusive result |
| S6-12 | Add service timeout/failure handling | Must | Main application handles service failure |
| S6-13 | Evaluate prototype quality | Must | Limitations and test results documented |

### Acceptance criteria

- FastAPI service runs separately from Express.
- Main backend validates and authorizes requests before invoking the Python service.
- Risk outputs are labeled as preliminary estimates, not diagnoses.
- The response records model identifier/version and timestamp.
- The system handles missing, invalid, or out-of-range inputs safely.
- OCR output is treated as extracted text, not proof of medicine identity.
- Medicine matching returns candidates or an explicit inconclusive state.
- The UI does not advise users to start, stop, or change medication.
- Service timeouts and failures do not crash unrelated application modules.

### Clinical and data-safety gate

Do not claim clinical accuracy or deploy for real clinical decisions without appropriate dataset review, validation, performance assessment, subgroup/fairness evaluation, and qualified clinical review. Use synthetic or properly de-identified data during development.

### Sprint 6 deliverable

A separately running Python service with safe prototype risk-assessment and medicine-package OCR workflows.

---

## Sprint 7 — Dashboards and end-to-end integration

**Duration:** 2 weeks  
**Sprint goal:** Connect the modules into a coherent application and deliver role-specific dashboards.

### Tasks

| ID | Task | Priority | Expected result |
|---|---|---|---|
| S7-01 | Build patient dashboard | Must | Patient's own appointments and follow-ups |
| S7-02 | Build doctor dashboard | Must | Assigned appointments and follow-up work |
| S7-03 | Build admin dashboard | Must | Operational user/platform management |
| S7-04 | Build aggregate management dashboard | Should | Approved aggregate metrics only |
| S7-05 | Integrate appointment notifications | Must | Status changes trigger notification jobs |
| S7-06 | Integrate follow-up reminders | Must | End-to-end reminder workflow |
| S7-07 | Integrate risk assessment UI | Must | Clear input, result, and limitation presentation |
| S7-08 | Integrate medicine image UI | Must | Upload, progress, candidate/inconclusive result |
| S7-09 | Improve loading/error/empty states | Must | Consistent user feedback |
| S7-10 | Run end-to-end tests | Must | Core journeys pass |
| S7-11 | Accessibility and responsive review | Should | Usable on mobile and desktop |

### Acceptance criteria

- Patient, doctor, admin, and management users see role-appropriate views.
- Frontend visibility is backed by backend authorization.
- Main workflows operate across the integrated services.
- Error and loading states are understandable.
- Management views do not expose individual patient records unless a separate approved policy explicitly allows it.
- Core user journeys pass end-to-end tests.

### Sprint 7 deliverable

Integrated SwasthyaCare application with role-specific dashboards.

---

## Sprint 8 — Quality assurance, security, and deployment

**Duration:** 2 weeks  
**Sprint goal:** Stabilize the application and prepare a controlled demonstration release.

### Tasks

| ID | Task | Priority | Expected result |
|---|---|---|---|
| S8-01 | Run full regression suite | Must | Critical workflows pass |
| S8-02 | Test authorization boundaries | Must | Cross-role and cross-patient access blocked |
| S8-03 | Test appointment concurrency | Must | No double-approved exclusive slot |
| S8-04 | Test upload security | Must | Invalid and oversized uploads rejected |
| S8-05 | Review secrets and configuration | Must | No credentials in repository |
| S8-06 | Test notification retry behavior | Must | Failures recover safely |
| S8-07 | Test ML/OCR failure paths | Must | Safe fallback messages |
| S8-08 | Add structured logging and monitoring basics | Should | Operational errors diagnosable |
| S8-09 | Prepare deployment configuration | Must | Reproducible demo deployment |
| S8-10 | Prepare backup/restore approach | Should | Recovery steps documented |
| S8-11 | Update user and technical documentation | Must | Setup and usage instructions complete |
| S8-12 | Prepare final demo and known-limitations list | Must | Demonstration is transparent |

### Acceptance criteria

- No known critical authorization or data-exposure defect remains open.
- Core workflows pass regression tests.
- Appointment concurrency behavior is tested.
- The system uses synthetic or properly de-identified demo data.
- Environment secrets are not committed.
- Deployment and rollback/recovery steps are documented.
- Known limitations are visible in the demo and documentation.
- The release is explicitly labeled as a project demonstration, not a clinically validated product.

### Sprint 8 deliverable

A tested, documented, controlled demonstration release.

---

# 5. Product backlog and priority

Use these priority labels:

- **P0 — Must:** Required for a usable and safe project foundation.
- **P1 — Should:** Important for the intended demonstration.
- **P2 — Could:** Add only if time and capacity permit.

| Backlog ID | Feature | Priority | Planned sprint |
|---|---|---|---|
| PB-01 | Repository and development setup | P0 | 1 |
| PB-02 | React/Express/MongoDB connection | P0 | 1 |
| PB-03 | Authentication | P0 | 2 |
| PB-04 | Role-based authorization | P0 | 2 |
| PB-05 | Patient profile | P0 | 2 |
| PB-06 | Doctor directory | P0 | 3 |
| PB-07 | Doctor availability | P0 | 3 |
| PB-08 | Appointment request | P0 | 4 |
| PB-09 | Doctor approval/rejection | P0 | 4 |
| PB-10 | Double-booking protection | P0 | 4 |
| PB-11 | Follow-up plan | P0 | 5 |
| PB-12 | Recovery updates | P0 | 5 |
| PB-13 | Email/SMS reminder foundation | P1 | 5 |
| PB-14 | Heart-risk prototype | P0 for project scope | 6 |
| PB-15 | Diabetes-risk prototype | P0 for project scope | 6 |
| PB-16 | Medicine-package OCR prototype | P1 | 6 |
| PB-17 | Patient dashboard | P0 | 7 |
| PB-18 | Doctor dashboard | P0 | 7 |
| PB-19 | Admin dashboard | P1 | 7 |
| PB-20 | Aggregate management dashboard | P1 | 7 |
| PB-21 | Security and regression testing | P0 | 8 |
| PB-22 | Demonstration deployment | P0 | 8 |

Priorities describe the proposed project release, not clinical importance. A feature may be deferred if its safety or validation prerequisites are not met.

# 6. Definition of Ready (DoR)

A backlog item can enter a sprint when:

- Its user or business value is understood.
- Acceptance criteria are written.
- Dependencies are known.
- API/data implications have been considered.
- Required design decisions are resolved.
- Test approach is understood.
- The task is small enough to complete within the sprint or has been split.

# 7. Definition of Done (DoD)

A task is complete only when:

- Code is implemented and reviewed.
- Validation and authorization are implemented server-side.
- Relevant unit/integration tests pass.
- Error and loading behavior is handled.
- No secrets or unnecessary sensitive data are committed or logged.
- Documentation is updated.
- Changes are merged through the agreed Git workflow.
- Acceptance criteria are demonstrated.

For healthcare-related features, the relevant safety limitations and data-handling requirements must also be reflected in the UI and documentation.

# 8. Scrum operating rhythm

For each two-week sprint:

| Event | Suggested cadence | Purpose |
|---|---|---|
| Sprint planning | First day | Select achievable work and define sprint goal |
| Daily check-in | 10–15 minutes on workdays | Share progress, next task, blockers |
| Backlog refinement | Once per week | Clarify and prepare upcoming work |
| Sprint review | Final day | Demonstrate completed functionality |
| Sprint retrospective | Final day | Identify process improvements |

For a solo student project, these ceremonies can be lightweight. Maintain a visible task board with `Backlog`, `Ready`, `In Progress`, `In Review`, `Testing`, and `Done`.

# 9. MongoDB implementation direction

## 9.1 Proposed collections

The initial collection set is:

- `users`
- `patientProfiles`
- `doctorProfiles`
- `availabilitySlots`
- `appointments`
- `followUpPlans`
- `recoveryUpdates`
- `riskAssessments`
- `medicineImageRecords`
- `notifications`
- `auditEvents`

Do not create every collection in Sprint 1. Add collections alongside their owning feature and document their validation rules and indexes.

## 9.2 MongoDB engineering rules

1. Use Mongoose or the native MongoDB driver consistently; choose one before implementation.
2. Define schema validation and required fields for each collection.
3. Use unique indexes for identifiers that must be unique.
4. Add indexes based on actual query patterns, not speculation.
5. Store references between independently managed entities where appropriate.
6. Avoid unbounded arrays in user or appointment documents.
7. Use transactions where a workflow requires multiple writes to succeed together and the deployment supports them.
8. Use an atomic conditional update or transaction-backed reservation strategy for appointment approval.
9. Store timestamps consistently in UTC; convert to local time only for display.
10. Never expose MongoDB documents directly without response shaping and field filtering.

## 9.3 Appointment concurrency design requirement

Before implementation, decide the slot policy:

- If a slot is exclusively bookable, enforce one approved appointment per slot using a database-level strategy.
- If pending requests do not reserve a slot, approval must atomically verify and claim the slot.
- If pending requests temporarily reserve a slot, define expiry and cleanup behavior.
- A UI check alone is not sufficient protection against concurrent requests.

The exact index or transaction design depends on whether availability slots are pre-created documents or represented as recurring schedules.

# 10. Suggested repository structure

A simple monorepo is recommended for the initial project:

```text
swasthyacare/
│
├── client/                      # React + Vite
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
│
├── server/                      # Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── doctors/
│   │   │   ├── appointments/
│   │   │   ├── followups/
│   │   │   ├── notifications/
│   │   │   └── audit/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── app.js
│   └── package.json
│
├── ai-service/                  # Python + FastAPI
│   ├── app/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   └── requirements.txt
│
├── docs/
│   ├── planning/
│   ├── requirements/
│   ├── design/
│   ├── testing/
│   └── sprint-planner/
│
├── .gitignore
└── README.md
```

Keep business logic in feature modules rather than putting all code into one large route or controller file.

# 11. Git workflow

Suggested branches:

- `main` — stable, reviewed code.
- `develop` — integration branch.
- `feature/<short-name>` — feature work.
- `fix/<short-name>` — bug fixes.

Suggested commit style:

```text
feat(auth): add patient registration
feat(appointments): add appointment request endpoint
fix(appointments): prevent duplicate slot approval
test(auth): add invalid login tests
docs(sprints): update sprint 1 progress
```

Pull request checklist:

- [ ] Task ID included in PR description.
- [ ] Acceptance criteria addressed.
- [ ] Tests added or updated.
- [ ] No secrets or real patient data included.
- [ ] Authorization checked on protected operations.
- [ ] Documentation updated where needed.

# 12. Sprint tracking template

Copy this section for each sprint.

## Sprint [number] — [name]

**Sprint dates:**  
**Sprint goal:**  
**Capacity / available hours:**  
**Sprint owner:**  

| Task ID | Task | Priority | Owner | Status | Notes |
|---|---|---|---|---|---|
| | | | | Backlog | |

### Sprint review

- Completed:
- Not completed:
- Demo result:
- Bugs found:
- Acceptance criteria met:

### Retrospective

- What went well?
- What was difficult?
- What should change next sprint?

### Carry-over work

| Task ID | Reason | New target sprint |
|---|---|---|
| | | |

# 13. Sprint 1 — Exact starting checklist

Start with these tasks in order:

### Day 1 — Repository and environment

- [ ] Create the `swasthyacare` project folder.
- [ ] Initialize Git.
- [ ] Create the root README.
- [ ] Add `.gitignore`.
- [ ] Create `client`, `server`, `ai-service`, and `docs` folders.
- [ ] Create the initial project board.

### Days 2–3 — Frontend

- [ ] Create React app using Vite.
- [ ] Remove starter/demo code that is not needed.
- [ ] Create a basic application layout.
- [ ] Add a simple API service module.
- [ ] Confirm the frontend runs locally.

### Days 4–5 — Backend

- [ ] Initialize Node.js project.
- [ ] Install and configure Express.
- [ ] Create application entry point.
- [ ] Add `/api/health`.
- [ ] Add centralized error handling.
- [ ] Confirm the backend runs locally.

### Days 6–7 — MongoDB

- [ ] Confirm local MongoDB or approved hosted development environment.
- [ ] Add MongoDB connection configuration.
- [ ] Add environment-variable validation.
- [ ] Connect the backend to MongoDB.
- [ ] Confirm connection failure produces a clear error.
- [ ] Do not commit database credentials.

### Days 8–9 — Integration and quality

- [ ] Configure frontend-to-backend development requests.
- [ ] Display backend health status in the frontend.
- [ ] Add linting/formatting.
- [ ] Add a basic backend test.
- [ ] Verify `.env` files are ignored by Git.

### Day 10 — Sprint review

- [ ] Demonstrate frontend running.
- [ ] Demonstrate backend health endpoint.
- [ ] Demonstrate MongoDB connection.
- [ ] Test documented setup from a clean environment if possible.
- [ ] Update README.
- [ ] Review Sprint 1 acceptance criteria.
- [ ] Plan Sprint 2.

## Sprint 1 completion gate

Do not begin authentication feature work until:

- The frontend runs.
- The backend runs.
- MongoDB connection is verified.
- Environment secrets are protected.
- The health endpoint works.
- Setup steps are documented.

# 14. Dependencies and decisions to resolve

| ID | Decision / dependency | Needed by | Status |
|---|---|---|---|
| DEC-01 | Confirm MongoDB deployment: local or hosted development instance | Sprint 1 | Open |
| DEC-02 | Select Mongoose or native MongoDB driver | Sprint 1 | Open |
| DEC-03 | Select authentication/session strategy | Sprint 2 | Open |
| DEC-04 | Confirm doctor verification/onboarding process | Sprint 3 | Open |
| DEC-05 | Decide pending appointment slot reservation and expiry | Sprint 4 | Open |
| DEC-06 | Decide multiple pending requests policy | Sprint 4 | Open |
| DEC-07 | Select email and SMS providers | Sprint 5 | Open |
| DEC-08 | Select medicine reference source | Sprint 6 | Open |
| DEC-09 | Confirm datasets, model provenance, and evaluation plan | Sprint 6 | Open |
| DEC-10 | Select hosting and private object storage | Sprint 8 | Open |
| DEC-11 | Define data retention and deletion policy | Before real personal data | Open |
| DEC-12 | Confirm exact management reporting permissions | Sprint 7 | Open |

## 15. Release milestones

### Milestone 1 — Technical foundation
After Sprint 1: the project runs locally and connects to MongoDB.

### Milestone 2 — Secure application foundation
After Sprint 2: users can authenticate and access only permitted profile data.

### Milestone 3 — Appointment MVP
After Sprint 4: patient appointment requests can be reviewed and approved/rejected by doctors.

### Milestone 4 — Follow-up MVP
After Sprint 5: clinicians can create plans and patients can submit recovery updates.

### Milestone 5 — Intelligent feature prototypes
After Sprint 6: risk and medicine-image assistance prototypes work with synthetic/de-identified test data and clear limitations.

### Milestone 6 — Demonstration release
After Sprint 8: integrated, tested, documented demonstration deployment.

---

## 16. Project implementation rule

**We will work sprint by sprint.**

For every sprint:

1. Understand the task before coding.
2. Confirm the expected behavior and acceptance criteria.
3. Design the API and data model where needed.
4. Implement in small steps.
5. Test each feature.
6. Review the code and update documentation.
7. Demonstrate the completed work before moving to the next sprint.

Do not mark a task done merely because the code runs. It is done when its acceptance criteria and relevant tests pass.

**Current status:** Sprint 1 — Not started.  
**Next action:** Set up the repository and development environment.
