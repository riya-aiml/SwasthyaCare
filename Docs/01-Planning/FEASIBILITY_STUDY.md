# Feasibility Study

**Document ID:** SC-PLN-002  
**Version:** 0.1  
**Status:** Preliminary

## 1. Technical feasibility
The proposed React, Node.js/Express, MongoDB, and Python/FastAPI stack is technically capable of supporting the planned modules. A modular backend with a separate Python service for ML/OCR is a reasonable starting point.

Open technical questions:
- Whether MongoDB or a relational database better fits appointment, clinician, and clinical-record relationships.
- Which approved dataset and model will support each risk-assessment use case.
- Which OCR/image-matching approach and trusted medicine reference source will be used.
- Which email and SMS providers are available and suitable.

## 2. Economic feasibility
A prototype can be developed using local development tools and free/low-cost service tiers where available. Production costs may include hosting, database, object storage, backups, email, SMS, monitoring, security review, and clinical validation.

A cost estimate is **TBD** until providers and expected usage are selected.

## 3. Operational feasibility
The product should provide separate workflows for patients, doctors, administrators, and hospital management. Usability must be tested with representative users. Staff training and workflow fit are not yet validated.

## 4. Schedule feasibility
A phased MVP is more realistic than implementing every feature simultaneously. Appointment management and secure role-based access should establish the platform foundation. Follow-up, risk assessment, and medicine identification can then be integrated in controlled increments.

A detailed schedule and team capacity are **TBD**.

## 5. Legal, privacy, and clinical feasibility
Before using real patient data or making the system available for clinical use, obtain appropriate privacy, security, clinical, and regulatory review for the intended jurisdiction and use. This document is not legal or clinical advice.

## 6. Preliminary conclusion
**Feasible as a learning/prototype project**, subject to scope control and use of synthetic/de-identified data. **Not yet established as ready for real-world clinical deployment.**
