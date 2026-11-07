# AI Campus Recruitment & Placement Management System
## Full-Stack University Career Portal with Procedural 3D WebGL Environments & Dual-Mode AI

[![CI Pipeline](https://github.com/sai46-ai/AI-Campus-Recruitment-System/actions/workflows/ci.yml/badge.svg)](https://github.com/sai46-ai/AI-Campus-Recruitment-System/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. PROJECT TITLE & PURPOSE

The **AI Campus Recruitment System** is an enterprise-grade, full-stack recruitment and placement management platform engineered for universities, corporate recruitment teams, and university students.

The platform streamlines the end-to-end institutional hiring lifecycle: from posting verified placement drives and academic eligibility gating, to AI-assisted ATS resume parsing, candidate scoring, applicant pipeline tracking, and institutional NIRF/NAAC placement analytics. The user experience combines an accessible, collegiate multi-color design system with five interactive procedural 3D WebGL environments that visualize institutional data topology without interfering with usability or content legibility.

---

## 2. MAIN USER ROLES

The application enforces server-side Role-Based Access Control (RBAC) across four distinct institutional personas:

1. **Student Candidate (`student`):**
   - Discovers active placement drives filtered by employment type, work model, and eligibility cutoffs.
   - Builds resumes using the interactive Resume Studio or uploads existing documents (PDF/DOCX).
   - Receives multidimensional ATS compatibility scores and personalized skill gap analyses.
   - Applies for opportunities and tracks real-time progress through recruitment pipelines.
2. **Corporate Recruiter (`recruiter`):**
   - Posts campus placement drives with defined academic cutoff criteria (minimum CGPA, branches, active backlogs).
   - Evaluates applicant pools ranked by AI-driven candidate-job match compatibility scores.
   - Inspects candidate profiles, downloads submitted resumes, and updates applicant lifecycle statuses.
   - Schedules technical interviews and coordinates on-campus recruitment milestones.
3. **Placement Cell Officer (`placement_officer`):**
   - Reviews and approves or rejects incoming recruiter drive postings before student publication.
   - Monitors institutional placement velocity, cohort conversion rates, and salary tier distributions.
   - Generates NIRF/NAAC compliant placement audit reports and exports telemetry to CSV.
4. **System Administrator (`admin`):**
   - Manages the institutional user directory across all departments.
   - Reassigns user roles, activates or deactivates accounts, and audits system access.
   - Monitors system health, database readiness, and security integrity.

---

## 3. MAJOR IMPLEMENTED FEATURES

- **Dual-Mode AI ATS Engine:**
  - **Cloud LLM Mode:** Leverages Google Gemini 1.5 Flash for contextual resume parsing, skill extraction, and candidate-job matching.
  - **Local Heuristic Mode:** Automatically activates a deterministic natural language processing (NLP) parser when a Gemini API key is absent or unreachable. Detects 36+ technical skills, validates contact details, and scores resumes with zero downtime.
- **Five Procedural 3D WebGL Environments:**
  - Full-screen procedural Three.js canvases rendered beneath the interface: *Digital River Valley* (Public/Landing), *Talent Network Core* (Auth), *Recruitment Connectivity Grid* (Recruiter/Placement/Admin), *Resume & Profile Studio* (Student), and *Opportunity Horizon* (Jobs/Applications).
  - Background layers adhere to strict `pointer-events: none` and `z-index: 0` separation, guaranteeing zero interference with UI clicks or form inputs.
- **Enterprise Security Hardening:**
  - Short-lived JWT access tokens (15m) stored exclusively in memory via a dedicated client-side token broker.
  - Rotating refresh tokens stored in MongoDB with SHA-256 hashing, token family invalidation, and replay attack detection.
  - Double-submit HMAC-SHA256 CSRF protection separating pre-authentication and authenticated scopes.
  - Strict ReDoS defense, password hashing with `bcryptjs`, and OWASP-compliant HTTP headers via `helmet`.
- **Zero Mandatory External Services:**
  - Automatically falls back to an embedded in-memory MongoDB instance (`mongodb-memory-server`) during local development if an external MongoDB daemon is not running.
  - Works with or without Redis, SMTP, or Google OAuth.

---

## 4. VERIFIED ARCHITECTURE & TECHNOLOGY STACK

```
+-----------------------------------------------------------------------------------------+
|                                     FRONTEND SPA                                        |
|  React 18.3 | TypeScript 5.5 | Vite 5.3 | Tailwind CSS 3.4 | TanStack React Query 5    |
|  Three.js 0.187 (5 Procedural 3D Environments) | Lucide React Icons | Axios            |
+-----------------------------------------------------------------------------------------+
                                             |
                         HTTPS / TLS 1.3 | HTTP /api/v1 (CORS)
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                  BACKEND REST API                                       |
|  Node.js 20+ | Express 4.19 | TypeScript 5.5 | Mongoose 8.5                             |
|  Double-Submit HMAC-SHA256 CSRF | MemoryStore Rate Limiting | Multer Disk Storage       |
|  Dual-Mode AI Engine: Google Gemini 1.5 Flash OR Local Deterministic Heuristic NLP       |
+-----------------------------------------------------------------------------------------+
                    |                                                    |
                    v                                                    v
+-------------------------------------+             +-------------------------------------+
|        DATABASE: MONGODB             |             |        PYTHON AI MICROSERVICE       |
|  - MongoDB 6.0+ (Mongoose ODM)      |             |  - Python 3.10+ / FastAPI 0.109     |
|  - Local Dev: MongoMemoryServer     |             |  - Pure-Python PyPDF & PDFPlumber   |
|  - Docker: Named volume mongodb_data|             |  - Port 8000 (OpenAPI docs at /docs)|
+-------------------------------------+             +-------------------------------------+
```

---

## 5. REPOSITORY STRUCTURE

```text
AI-CAMPUS-RECRUITMENT-SYSTEM01/
│
├── README.md                          # Canonical project documentation
├── .env.example                       # Root Docker Compose environment template
├── .gitignore                         # Comprehensive Git exclusion rules
├── docker-compose.yml                 # Multi-container production Docker blueprint
├── nginx.conf                         # Reverse proxy routing configuration
│
├── docs/                              # Technical specifications
│   ├── ARCHITECTURE.md                # System topology, APIs & data flow
│   ├── DEVELOPMENT.md                 # Local setup, scripts & testing guide
│   ├── CONFIGURATION.md               # Environment variables & secrets guide
│   ├── DEPLOYMENT.md                  # Live portfolio deployment instructions
│   └── SECURITY.md                    # Authentication, session rotation & CSRF
│
├── frontend/                          # Client Single Page Application
│   ├── src/
│   │   ├── features/                  # Domain feature modules (auth, jobs, student, recruiter, etc.)
│   │   └── shared/
│   │       └── components/background/ # Protected Three.js 3D environments (17 files)
│   ├── public/                        # Static assets (favicon.svg)
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js             # Design tokens & contrast calibration
│   └── vite.config.ts                 # Vite bundle configuration
│
├── backend/                           # Node.js / Express REST API
│   ├── src/
│   │   ├── config/                    # Database, Redis, Gemini & seed configurations
│   │   ├── features/                  # Domain route controllers, models & services
│   │   └── shared/                    # Middleware, security utils & crypto helpers
│   ├── tests/                         # Jest unit & integration test suites (130 tests)
│   ├── uploads/                       # Private resume file storage (.gitkeep)
│   ├── package.json                   # Backend dependencies
│   └── tsconfig.json                  # TypeScript compiler settings
│
├── ai-service/                        # Autonomous Python AI Microservice
│   ├── app/                           # FastAPI routers, analyzers & skill extractors
│   ├── tests/                         # Pytest test suite (7 tests)
│   ├── main.py                        # Service entrypoint
│   └── requirements.txt               # Pure-Python dependencies
│
└── .github/
    └── workflows/ci.yml               # GitHub Actions CI pipeline
```

---

## 6. PREREQUISITES & INSTALLATION

### Prerequisites
- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`
- **Python:** `>= 3.10` *(for `ai-service`)*
- **MongoDB:** *(Optional for local dev — in-memory server runs automatically)*

### Installation
Clone the repository:
```bash
git clone https://github.com/your-username/ai-campus-recruitment.git
cd ai-campus-recruitment
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

Install AI service dependencies (optional):
```bash
cd ../ai-service
pip install -r requirements.txt
```

---

## 7. DEVELOPMENT STARTUP

### Running Locally (Zero Configuration)
The system requires zero manual configuration out of the box.

1. **Start Backend (Terminal 1):**
   ```bash
   cd backend
   npm run build
   npm start
   ```
   *Backend starts on `http://localhost:5000/api/v1` with embedded in-memory MongoDB and auto-seeds all 4 demo accounts.*

2. **Start Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```
   *Frontend starts on `http://localhost:5173`.*

3. **Open Browser:** Navigate to `http://localhost:5173/login` and log in with any seeded account:
   - **Student:** `student@campus.edu` / `Password@123`
   - **Recruiter:** `recruiter@campus.edu` / `Password@123`
   - **Placement Officer:** `placement@campus.edu` / `Password@123`
   - **Administrator:** `admin@campus.edu` / `Password@123`

---

## 8. COMMAND REFERENCE

| Subsystem | Command | Description |
| :--- | :--- | :--- |
| **Backend** | `npm --prefix backend run build` | Compiles TypeScript source to `/backend/dist`. |
| **Backend** | `npm --prefix backend start` | Starts compiled production server (`node dist/server.js`). |
| **Backend** | `npm --prefix backend run dev` | Runs development server with hot-reload (`ts-node-dev`). |
| **Backend** | `npm --prefix backend test` | Executes Jest test suites (130 tests across 11 suites). |
| **Frontend** | `npm --prefix frontend run dev` | Runs Vite development server on port 5173. |
| **Frontend** | `npm --prefix frontend run build` | Compiles TypeScript and builds production distribution in `/frontend/dist`. |
| **Frontend** | `npm --prefix frontend run preview` | Previews production build locally. |
| **AI Service**| `cd ai-service && python main.py` | Starts FastAPI service on port 8000. |
| **AI Service**| `cd ai-service && pytest` | Runs Python resume parser test suite (7 tests). |

---

## 9. CONFIGURATION & ENVIRONMENT VARIABLES

Refer to [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) for full variable descriptions.

### Core Backend Variables (`/backend/.env`)
```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ai_campus_recruitment

# Authentication Secrets (Must be >= 32 chars in production)
JWT_SECRET=super_secret_jwt_access_key_change_in_production_2026
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_change_in_production_2026
CSRF_SECRET=super_secret_csrf_key_change_in_production_2026

# Portfolio Demonstration Flags
ALLOW_PRODUCTION_SEED=true
ALLOW_DEV_OTP=true

# Optional Integrations
GEMINI_API_KEY=
REQUIRE_GEMINI=false
REDIS_URL=
GOOGLE_CLIENT_ID=
UPLOAD_DIR=./uploads
```

### Core Frontend Variables (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_ENV=development
```

---

## 10. AUTHENTICATION & SECURITY OVERVIEW

- **In-Memory Access Tokens:** JWT access tokens (15m) are stored in client memory via `tokenBroker.ts` and never written to `localStorage` or `sessionStorage`.
- **Rotating Refresh Tokens:** HttpOnly cookies (`__Host-refresh_token`) carry refresh tokens paired with MongoDB session documents (`ISession`). Automatic rotation detects replay attacks and invalidates compromised token families.
- **Double-Submit CSRF Protection:** HMAC-SHA256 signatures validate state-changing requests, cryptographically bound to session IDs.
- **PII & File Download Isolation:** Uploaded resumes stored on disk are strictly gated behind authenticated routes enforcing horizontal ownership checks.

---

## 11. DEPLOYMENT PREPARATION

The repository is configured for immediate deployment using:
1. **Docker Compose:** Run `cp .env.example .env && docker compose up -d --build`. Persists data to named Docker volumes.
2. **PaaS Hosting:** Deploy frontend to Vercel/Netlify and backend to Render/Railway connected to a free-tier MongoDB Atlas cluster. Detailed walkthrough provided in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 12. KNOWN LIMITATIONS & RETIRED TOOLING

- **Retired Playwright E2E Infrastructure:** Standalone browser automation files and ephemeral screenshots were removed during repository consolidation. The test suite relies on 130 comprehensive Jest integration tests (`supertest`), Python `pytest`, and Vite production compilation checks.
- **Email Delivery:** Production registrations require either configured SMTP credentials (`SMTP_HOST`, `SMTP_USER`, etc.) or the portfolio demonstration flag `ALLOW_DEV_OTP=true` (which logs verification OTPs to the server console).
- **Google OAuth:** Backend endpoint `/api/v1/auth/google` is implemented and verified, but the web UI currently uses email/password authentication.
