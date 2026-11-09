# 🏥 SwasthyaCare — Healthcare Management & Clinical Decision Platform

**Version:** 1.0.0 (Release Demonstration)  
**Status:** ✅ Sprints 1–8 Completed (100% Passed)  
**Last Updated:** November 2026

---

## 🌟 Overview

**SwasthyaCare** is an end-to-end, privacy-compliant, multi-service digital health platform built according to the 8-sprint agile plan. It connects patients, clinicians, administrators, and hospital leadership through automated scheduling, clinical recovery monitoring, post-discharge triage, and artificial intelligence-assisted clinical decision support.

> **⚠️ Regulatory & Demonstration Notice:**  
> SwasthyaCare is an academic demonstration and software prototype. The included cardiovascular and diabetes risk calculators, as well as the OCR packaging scanner, are statistical decision-support instruments. **They do not constitute certified medical devices (SaMD) and must not be used for autonomous clinical diagnosis or unmonitored prescription alterations.**

---

## 🏛️ System Architecture

```
SwasthyaCare Monorepo
├── client/              # React 18 + Vite + Tailwind CSS Frontend (SPA)
│   ├── src/components/  # Role dashboards, appointment queues, AI risk calculators, OCR
│   └── src/services/    # Axios/Fetch API clients for auth, appointments, follow-ups, AI
├── server/              # Node.js + Express REST API Gateway & Business Logic
│   ├── src/modules/     # Auth, Users, Doctors, Appointments, Follow-ups, Dashboards, AI
│   └── tests/           # Automated test suites for Sprints 2, 3, 4, 5, 6, 7, 8
├── ai-service/          # Python 3.11+ FastAPI Microservice (Port 8000)
│   ├── app/models/      # Framingham 10-Year ASCVD & FINDRISC Diabetes ML models
│   ├── app/services/    # Packaging OCR tokenizer & formulary candidate matcher
│   └── tests/           # Pytest test suite for ML models & Pydantic boundary validation
├── Docs/                # Complete SRS, Architecture, Sprint Planner & Runbooks
├── docker-compose.yml   # Multi-container orchestration (Mongo, Server, AI-Service, Client)
└── Dockerfile.*         # Container specifications for each microservice
```

---

## 🚀 Key Modules & Completed Sprints

| Sprint | Focus | Deliverables & Status | Tests |
|---|---|---|---|
| **Sprint 1** | Foundation & Environment | Vite React client, Express API, MongoDB connection, centralized error handling | ✅ Complete |
| **Sprint 2** | Auth & Identity | JWT Auth, bcrypt password hashing, 4 user roles, profile APIs | 15/15 Passed |
| **Sprint 3** | Discovery & Slots | Doctor directory, specialty filters, doctor profile management, bookable availability slots | 17/17 Passed |
| **Sprint 4** | Appointment Lifecycle | PENDING ➔ APPROVED / REJECTED state machine, double-booking prevention, cancellation workflows | 24/24 Passed |
| **Sprint 5** | Post-Discharge Follow-Up | Care plans with medications, recovery check-in logs, symptom triage alerts, background notification queue | 17/17 Passed |
| **Sprint 6** | AI Decision Support | Python FastAPI microservice, Framingham ASCVD model, FINDRISC model, OCR packaging matcher, safety notices | 9/9 Passed (Node) + 6 Pytest |
| **Sprint 7** | Dashboards & Integration | Role-specific dashboards (Patient, Doctor, Admin, Management), HIPAA aggregate privacy filter, notification triggers | 20/20 Passed |
| **Sprint 8** | QA, Concurrency & Release | Atomic CAS concurrency locking, authorization boundary matrix, secrets review, Docker orchestration, runbook | 12/12 Passed |
| **TOTAL** | **Full System Regression** | **All 8 Sprints verified with zero regressions** | **114/114 Passed (100%)** |

---

## 🛠️ Quick Start (Local Development)

### 1. Prerequisites
- **Node.js:** v18+ and `npm`
- **Python:** v3.11+ and `pip`
- **MongoDB:** v7.0+ (running locally on port 27017 or MongoDB Atlas connection)

### 2. Clone Repository
```bash
git clone https://github.com/riya-aiml/SwasthyaCare.git
cd SwasthyaCare
```

### 3. Start Database
```bash
# macOS (Homebrew)
brew services start mongodb/brew/mongodb-community@8.0

# Linux (systemd)
sudo systemctl start mongod
```

### 4. Start Python AI Microservice (Port 8000)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### 5. Start Backend API Server (Port 3001)
```bash
cd ../server
npm install
npm run dev
```

### 6. Start React Frontend (Port 5173)
```bash
cd ../client
npm install
npm run dev
```

Access the application in your browser: **http://localhost:5173**

---

## 🐳 Docker One-Click Deployment

To launch the complete multi-service stack (Database, AI Service, Backend Server, and Nginx Client) with a single command:
```bash
docker compose up --build
```

---

## 🧪 Automated Testing Suite

The repository includes comprehensive automated tests covering authentication, database locking, appointment state transitions, clinical triage, ML inference boundaries, and role authorization matrices:

```bash
# Run the entire full-system regression suite (Sprints 2 - 8)
cd server
npm run test:all

# Run specific sprint test suite
node tests/sprint7.test.js
node tests/sprint8.test.js

# Run Python FastAPI microservice pytest suite
cd ../ai-service
pytest tests/
```

---

## 👥 Role-Based Access Control (RBAC)

SwasthyaCare implements strict server-side authorization boundaries across 4 distinct roles:

| Role | Permitted Capabilities & Views |
|---|---|
| **Patient (`patient`)** | Book doctor slots, view appointment history, submit post-discharge recovery updates, calculate heart & diabetes risks, scan medicine strips |
| **Doctor (`doctor`)** | Configure availability slots, approve/decline appointment requests, create follow-up care plans, monitor patient recovery check-ins, clinical triage alerts |
| **Hospital Management (`hospital_management`)** | Executive analytics, department specialty breakdown, patient adherence averages, notification reliability telemetry (**Strict HIPAA Privacy Barrier: NO patient PII exposed**) |
| **Platform Administrator (`admin`)** | User accounts breakdown, doctor credential verification queue, system operational workload monitoring |

---

## 🔒 Security & Privacy Implementation

- **Idempotent Notifications:** Notification queue utilizes unique compound deduplication keys (`deduplicationKey: plan_id_day_channel` and `appt_id_status_recipient`) to prevent spamming or duplicated reminder dispatches.
- **Atomic Concurrency (CAS):** Slot reservation employs atomic `findOneAndUpdate` queries ensuring high-concurrency double-booking attempts return `409 Conflict`.
- **HIPAA Compliance:** Management dashboards only query population aggregations (`$group`, `$avg`); individual names, medical notes, and identifiers are strictly redacted.
- **Mandatory Disclaimers:** All AI and OCR endpoints return structured clinical limitation disclaimers prohibiting autonomous treatment adjustments.

---

## 📄 License & Attribution

Built for academic and healthcare software engineering demonstration.  
**SwasthyaCare Agile Development Team**
