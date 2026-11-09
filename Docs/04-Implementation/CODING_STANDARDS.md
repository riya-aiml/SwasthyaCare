# Coding Standards

## General
- Prefer readable, small, single-purpose functions.
- Use consistent naming and folder conventions.
- Avoid duplicated business logic.
- Validate inputs at system boundaries.
- Handle errors explicitly.
- Document non-obvious decisions, not obvious syntax.
- Never commit credentials, API keys, tokens, or real patient data.

## Frontend
- Use reusable components and clear page/layout boundaries.
- Keep API calls in a service layer.
- Represent loading, empty, success, and error states.
- Ensure forms have labels and accessible validation messages.
- Do not rely on frontend checks for authorization.

## Backend
- Separate routes, controllers, services, data access, and validation.
- Enforce authorization in backend services/middleware.
- Use structured error responses.
- Avoid logging sensitive information.
- Use transactions/atomic operations for appointment concurrency where supported.

## Python service
- Define typed request and response schemas.
- Pin dependencies.
- Version models and preprocessing.
- Validate inputs and handle out-of-distribution or invalid inputs safely.
- Record model version and evaluation metadata.
- Return an explicit failure/inconclusive status when appropriate.

## Testing
- Test happy paths, invalid inputs, permission failures, and concurrency cases.
- Use synthetic fixtures.
- Keep tests deterministic where possible.
