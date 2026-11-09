# SwasthyaCare
/Users/riyasharma/Desktop/Blockchain/SwasthyaCare/index.html
**Project:** AI-assisted healthcare management platform  
**Documentation version:** 0.1 (working baseline)  
**Status:** Planning and requirements draft  
**Last updated:** 2026-11-09

## Purpose
SwasthyaCare is intended to support healthcare workflows through appointment management, post-discharge follow-up, preliminary heart disease and diabetes risk assessment, and image-assisted medicine-packaging identification.

This repository contains the product and engineering documentation. It is the source of truth for agreed requirements and design decisions.

## Proposed technology (provisional)
- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB
- ML/OCR service: Python + FastAPI
- API style: REST over HTTPS

These choices are provisional until the architecture review is completed.

## Documentation map
| Folder | Contents |
|---|---|
| `01-Planning` | Project charter, feasibility, scope |
| `02-Requirements` | SRS, functional requirements, user stories, use cases, traceability |
| `03-System-Design` | HLD, LLD, database and API design, decision log |
| `04-Implementation` | Development plan, coding standards, Git workflow |
| `05-Testing` | Test strategy and test cases |
| `06-Deployment` | Deployment and environment guide |
| `07-Maintenance` | Maintenance and release process |

## Important product safety boundary
Risk assessment is decision support, not diagnosis. Medicine-image matching is not proof of medicine identity and must not recommend that a person take a medicine. Any real-world clinical use requires appropriate clinical validation, privacy/security review, and regulatory assessment.

## How to use
1. Review and approve the planning and requirements documents.
2. Resolve every item marked **TBD** in `03-System-Design/DECISION_LOG.md`.
3. Finalize architecture, data model, API contracts, and threat model.
4. Only then begin implementation.
