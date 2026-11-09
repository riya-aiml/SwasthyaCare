# API Specification – Initial Endpoint Inventory

**Status:** Draft inventory; request/response schemas are not yet baselined.

Base path proposal: `/api/v1`

## Authentication and profiles
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Patient registration |
| POST | `/auth/login` | Authenticate |
| POST | `/auth/logout` | End session |
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update permitted profile fields |

## Doctors and appointments
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/doctors` | Search doctors |
| GET | `/doctors/{doctorId}/slots` | View available slots |
| POST | `/appointments` | Create pending request |
| GET | `/appointments` | List appointments visible to caller |
| GET | `/appointments/{appointmentId}` | View permitted appointment |
| POST | `/appointments/{appointmentId}/approve` | Doctor approves |
| POST | `/appointments/{appointmentId}/reject` | Doctor rejects |
| POST | `/appointments/{appointmentId}/cancel` | Request/perform permitted cancellation |
| PUT | `/doctors/me/availability` | Manage doctor availability |

## Follow-up
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/patients/{patientId}/follow-ups` | Create follow-up plan |
| GET | `/follow-ups` | List authorized follow-ups |
| POST | `/follow-ups/{followUpId}/updates` | Submit recovery update |
| GET | `/follow-ups/{followUpId}/updates` | Review permitted updates |

## Risk assessment
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/risk-assessments/heart` | Request heart-risk estimate |
| POST | `/risk-assessments/diabetes` | Request diabetes-risk estimate |
| GET | `/risk-assessments` | List permitted assessment history |

## Medicine identification
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/medicine-identification` | Upload packaging image and request processing |
| GET | `/medicine-identification/{jobId}` | Retrieve processing result |

## API rules
- Enforce authorization and object-level access checks on every protected endpoint.
- Validate all input on the server.
- Use appropriate HTTP status codes.
- Apply rate limits to authentication, uploads, and expensive model endpoints.
- Use idempotency/concurrency controls where duplicate submissions could cause harm.
- Do not include sensitive health details in URLs.
- Publish an OpenAPI specification before frontend/backend integration is considered complete.
