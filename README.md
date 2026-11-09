# SwasthyaCare - Healthcare Management Platform

**Version:** 1.0.0  
**Status:** Sprint 1 - In Progress  
**Last Updated:** 2026-11-09

## 🏥 About

SwasthyaCare is an AI-assisted healthcare management platform that supports:
- Appointment management with doctor approval workflow
- Post-discharge follow-up and recovery tracking
- Preliminary heart disease and diabetes risk assessment
- Medicine packaging identification via OCR

**⚠️ Important Safety Notice:**
This is a demonstration project. Risk assessments are decision support tools, not medical diagnoses. Any real-world clinical use requires appropriate validation, security review, and regulatory assessment.

## 🏗️ Project Structure

```
SwasthyaCare/
├── client/              # React + Vite frontend
├── server/              # Node.js + Express backend
├── ai-service/          # Python + FastAPI ML/OCR service
├── Docs/                # Complete project documentation
│   ├── 01-Planning/
│   ├── 02-Requirements/
│   ├── 03-System-Design/
│   ├── 04-Implementation/
│   ├── 05-Testing/
│   ├── 06-Deployment/
│   ├── 07-Maintenance/
│   └── Sprint/
└── README.md
```

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **ML Service:** Python + FastAPI
- **API Style:** REST over HTTPS

## 📋 Sprint Progress

### Sprint 1: Project Foundation ✅ COMPLETE
**Goal:** Create a reproducible development environment with React, Express, and MongoDB connected.
**Completed:** 2026-11-09

### Sprint 2: Authentication & User Profiles ✅ COMPLETE
**Goal:** Allow users to register and log in securely, with server-side role enforcement.
- [x] User schema with roles (Patient, Doctor, Admin)
- [x] Password hashing with bcrypt (salt rounds: 10)
- [x] JWT token authentication
- [x] Protected routes middleware
- [x] Role-based access control (RBAC)
- [x] User profile management APIs
- [x] React Login, Register, and Profile UI
- [x] 15/15 automated tests passing
**Completed:** 2026-11-10

### Sprint 3: Doctor Discovery & Availability ⏳ NEXT
**Goal:** Allow patients to discover doctors and view available appointment slots.

## 🛠️ Getting Started

### Prerequisites
- Node.js v18+ and npm
- MongoDB (local or MongoDB Atlas account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SwasthyaCare
   ```

2. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Setup Backend**
   ```bash
   cd server
   npm install
   npm start
   ```
   Backend will run on http://localhost:3001

4. **Start MongoDB**
   ```bash
   brew services start mongodb/brew/mongodb-community@8.0
   ```

5. **Environment Variables**
   Backend `.env` is already configured for local MongoDB.
   
   Verify `server/.env` contains:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/swasthyacare
   ```

### Quick Test
After setup, visit:
- Frontend: http://localhost:5173
- Backend Health Check: http://localhost:5000/api/health

## 📖 Documentation

Full documentation is available in the `/Docs` folder:
- **Sprint Planner:** `Docs/Sprint/SwasthyaCare_Agile_Sprint_Planner_v1.0.md`
- **System Design:** `Docs/03-System-Design/`
- **Requirements:** `Docs/02-Requirements/`

## 🔐 Security Notes

- Never commit `.env` files
- Use synthetic/de-identified data during development
- All patient data access requires proper authorization
- Risk assessments are advisory only, not diagnostic

## 👥 User Roles

- **Patient:** Book appointments, view health records, submit recovery updates
- **Doctor:** Manage availability, approve appointments, create follow-up plans
- **Admin:** Platform management and user administration
- **Hospital Management:** Aggregate reporting and analytics

## 📅 Development Roadmap

- **Sprint 1 (Weeks 1-2):** Foundation - React, Express, MongoDB connection
- **Sprint 2 (Weeks 3-4):** Authentication and user profiles
- **Sprint 3 (Weeks 5-6):** Doctor discovery and availability
- **Sprint 4 (Weeks 7-8):** Appointment lifecycle with approval workflow
- **Sprint 5 (Weeks 9-10):** Post-discharge follow-up system
- **Sprint 6 (Weeks 11-12):** Risk assessment and OCR prototypes
- **Sprint 7 (Weeks 13-14):** Dashboards and integration
- **Sprint 8 (Weeks 15-16):** Testing, security, and deployment

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📝 License

This is an educational/demonstration project.

## 🤝 Contributing

This project follows Agile Scrum methodology with 2-week sprints.

---

**Current Sprint:** Sprint 1  
**Sprint Goal:** Foundation and developer setup  
**Sprint End Date:** Week 2
