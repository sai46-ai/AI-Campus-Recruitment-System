# Supplementary Report 01: Repository and Architecture Audit

**Project:** AI Campus Recruitment System  
**Repository:** `C:\Projects\AI-CAMPUS-RECRUITMENT-SYSTEM01`  
**Target Platform:** Render Cloud Platform  
**Audit Date:** November 9, 2026  
**Status:** COMPLETE & VERIFIED

---

## 1. Executive Summary

This audit establishes the architectural topology, service boundaries, and dependency relationships across the AI Campus Recruitment System. The application consists of three primary subsystems:
1. **Frontend:** React 18 single-page application built with Vite and TypeScript, featuring 5 distinct Three.js interactive visual environments.
2. **Backend Gateway:** Node.js 20 and Express v2 server providing REST APIs, authentication, authorization, session management, and business logic orchestration.
3. **AI Microservice:** Python 3.10+ FastAPI service providing NLP resume parsing, entity extraction, and fuzzy skill matching.

All prior traces of Vercel multi-service configuration (`vercel.json`) have been permanently removed. The repository is organized for clean deployment on Render using an Infrastructure-as-Code Blueprint (`render.yaml`).

---

## 2. Directory Structure and Service Inventory

```
AI-CAMPUS-RECRUITMENT-SYSTEM01/
├── render.yaml                             # Root Render Blueprint (3 services)
├── package.json                            # Root orchestration scripts
├── ai-service/                             # Python FastAPI NLP Microservice
│   ├── app/
│   │   ├── analyzer.py                     # ATS scoring and gap analysis
│   │   ├── config.py                       # Environment and path settings
│   │   ├── models.py                       # Pydantic schemas (request/response)
│   │   ├── parser.py                       # PDF/DOCX multi-engine text extraction
│   │   ├── skill_extractor.py              # Pure Python & regex skill extractor
│   │   └── skill_matcher.py                # String similarity & candidate scoring
│   ├── tests/                              # Unittest discovery test suite
│   ├── main.py                             # FastAPI entrypoint & middleware
│   └── requirements.txt                    # Pure Python dependencies (Python 3.10-3.14)
├── backend/                                # Node.js / Express API Service
│   ├── src/
│   │   ├── app.ts                          # Express application setup & middleware
│   │   ├── server.ts                       # Server bootstrap (0.0.0.0 host binding)
│   │   ├── config/                         # Database, Redis, seed configs
│   │   ├── features/                       # Modular business domains
│   │   │   ├── admin/                      # Admin user management & audit
│   │   │   ├── ai/                         # Integrated AI orchestration domain
│   │   │   ├── applications/               # Student job application lifecycle
│   │   │   ├── auth/                       # JWT, refresh rotation, CSRF, RBAC
│   │   │   ├── jobs/                       # Job postings and eligibility
│   │   │   ├── notifications/              # In-app notifications
│   │   │   ├── placement/                  # Placement officer analytics & CSV
│   │   │   └── resumes/                    # Resume upload & dynamic PDF generator
│   │   ├── routes/                         # Centralized route registry
│   │   └── shared/                         # Middleware, utilities, constants
│   ├── tests/                              # Jest automated test suites (13 suites)
│   └── tsconfig.json                       # TypeScript compiler configuration
├── frontend/                               # React 18 / Vite Single Page Application
│   ├── src/
│   │   ├── features/                       # Role-based dashboard interfaces
│   │   │   ├── admin/                      # Admin console
│   │   │   ├── auth/                       # Login, Register, OTP verification
│   │   │   ├── jobs/                       # Job discovery and detail
│   │   │   ├── placement/                  # Placement officer dashboard
│   │   │   ├── recruiter/                  # Job posting & applicant review
│   │   │   ├── resume/                     # Interactive ResumeBuilder & ATS review
│   │   │   └── student/                    # Student dashboard & application tracking
│   │   ├── shared/                         # Common UI components, hooks, services
│   │   │   ├── components/background/      # 17 Three.js procedural 3D environments
│   │   │   ├── services/api.ts             # Axios API client with correlation tracking
│   │   │   └── utils/clientLogger.ts       # Structured client-side telemetry logger
│   │   └── App.tsx                         # Client-side routing table
│   └── vite.config.ts                      # Vite build & chunking configuration
└── ProjectUpgradeReports/                  # Complete audit and verification reports
```

---

## 3. Communication Flow & Network Topology

### In-Development (Local Topology)
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api/v1`
- AI Microservice: `http://localhost:8000`

### In-Production (Render Cloud Topology)
```
[ User Browser ]
       │
       ▼ (HTTPS)
[ ai-campus-frontend.onrender.com ]  (Render Static Site)
       │
       │ (Cross-Site HTTPS AJAX with credentials: 'include')
       ▼
[ ai-campus-backend.onrender.com ]   (Render Web Service)
       │
       ├──► [ MongoDB Atlas Cluster ] (Encrypted TLS connection)
       │
       ├──► [ ai-campus-ai-service:8000 ] (Render Private Service via internal DNS)
       │
       └──► [ Google Gemini Flash API ] (Outbound TLS HTTPS fallback)
```

---

## 4. Architectural Boundaries and Invariants

1. **Express as the Sole Public API Gateway:**
   - The React frontend makes network requests exclusively to `VITE_API_URL` (Express `/api/v1`).
   - The frontend never connects directly to port 8000 or the AI microservice.
   - All AI requests (`/api/v1/ai/parse-resume`, `/api/v1/ai/match-candidate`, `/api/v1/ai/diagnostics`) are routed through Express with role verification, rate limiting, and request correlation.

2. **Multi-Tier AI Fallback Chain:**
   - **Tier 1:** Python FastAPI microservice (specialized regex/NLP tokenization & fast Levenshtein matching).
   - **Tier 2:** Google Gemini 1.5 Flash API (LLM semantic comprehension).
   - **Tier 3:** Built-in deterministic TypeScript heuristic parser & skill matcher (zero-dependency, in-process guarantee).
   - At no point does a failure in the AI microservice or Gemini API crash the backend or break candidate workflows.

3. **3D Visual Integrity Invariant:**
   - All 17 background files in `frontend/src/shared/components/background/` remain strictly identical to their SHA-256 baseline.
   - Procedural shaders, canvas mounting, camera animations, and responsive canvas behaviors are completely preserved.

---

## 5. Architectural Findings and Enhancements

| Area | Prior State | Render-Ready State | Verification |
| :--- | :--- | :--- | :--- |
| **Platform Target** | Conflicting `vercel.json` and local scripts | Unified `render.yaml` Blueprint | `render.yaml` valid, `vercel.json` removed |
| **Server Binding** | `app.listen(PORT)` (defaults to localhost) | `app.listen(Number(PORT), '0.0.0.0')` | Tested in `render_production_readiness.test.ts` |
| **Private DNS** | Assumed URL with protocol prefix | Dynamic normalization prepending `http://` | Tested in `render_production_readiness.test.ts` |
| **CORS Origins** | Strict exact string comparison | Trailing slashes stripped automatically | Tested with trailing slash input |
| **Cookie Scope** | `SameSite=Lax` (breaks cross-subdomain) | `SameSite=None; Secure=true` on HTTPS | Tested via supertest with `X-Forwarded-Proto` |

