# 01 — Repository and Architecture Audit

**Project:** AI Campus Recruitment System
**Audit Target:** Repository Topology, Dependencies, and Service Boundaries
**Target Environment:** Render Platform

---

## 1. Repository Inventory

The codebase is organized as a unified monorepo housing three decoupled runtime services and shared infrastructure:

```text
AI-CAMPUS-RECRUITMENT-SYSTEM01/
├── frontend/                     # React 18 SPA with Vite & Three.js
│   ├── src/
│   │   ├── app/App.tsx           # Root router with v7 future flags
│   │   ├── features/             # Feature domains (auth, student, recruiter, placement, admin, jobs)
│   │   └── shared/               # Shared UI, background 3D environments, context, services
│   ├── package.json              # React 18.3, React Router 6.30.4, Three.js 0.187.0
│   └── vite.config.ts            # Vite configuration with chunk splitting
├── backend/                      # Node.js Express REST API
│   ├── src/
│   │   ├── app.ts                # Express app setup, CORS, Helmet, CSRF, Correlation ID
│   │   ├── server.ts             # Entry point, MongoDB connection lifecycle
│   │   ├── features/             # Domains (auth, jobs, applications, placement, ai)
│   │   └── shared/               # Middleware (auth, csrf, rateLimiter, correlation, logging)
│   ├── tests/                    # 13 Jest Supertest test suites (154 tests)
│   └── package.json              # Express 4.19, Mongoose 8.5, TypeScript 5.5
├── ai-service/                   # Python FastAPI Microservice
│   ├── app/                      # Analyzer, parser, skill extractor, matcher
│   ├── tests/                    # Python unit test suite (7 tests)
│   ├── main.py                   # FastAPI application with graceful fallbacks
│   └── requirements.txt          # fastapi, uvicorn, pdfplumber, pypdf, rapidfuzz
├── render.yaml                   # Render Blueprint declaring 3 orchestrated services
├── vercel.json                   # Root Vercel diagnostic configuration
└── docker-compose.yml            # Local container development configuration
```

---

## 2. Service Architecture on Render

```text
Public Web Client (Browser)
       │
       ▼ (HTTPS)
Render Static Site (`ai-campus-frontend`)
React 18 + Vite SPA | Port 443 | CDN
URL: https://ai-campus-frontend.onrender.com
       │
       │ HTTPS REST Requests with Credentials
       │ Authorization: Bearer <token>
       │ X-CSRF-Token: <token>
       │ X-Correlation-ID: <uuid>
       ▼
Render Web Service (`ai-campus-backend`)
Node.js 20 + Express | Port 10000 | 1GB Persistent Disk at /var/data
URL: https://ai-campus-backend.onrender.com
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼                                 ▼                                 ▼
MongoDB Atlas Live Cluster          Persistent Upload Disk            Google Gemini 1.5 Flash
`ai-campus-cluster.36khklu`        `/var/data/uploads`                (Optional Cloud Tier)
       │
       ▼ (Private VPC Network: http://ai-campus-ai-service:8000)
Render Private Service (`ai-campus-ai-service`)
Python 3.10+ FastAPI | Port 8000 | Internal
- PDF & DOCX Parsing
- Skill Extraction (NLP / Regex)
- RapidFuzz Candidate Matching
```

---

## 3. Communication Invariants

1. **Express as Single Public Boundary:** The frontend never directly contacts the Python AI microservice. All AI parsing and matching flows route through Express (`/api/v1/ai/*` or `/api/v1/jobs/:id/applicants/rank`).
2. **Private Network AI Service:** On Render, `ai-campus-ai-service` is defined as a `pserv` (Private Service), binding to port 8000 and accessible only within Render's internal service mesh via `ai-campus-ai-service:8000`.
3. **Stateless Frontend:** The frontend holds zero database credentials or AI service keys. All sensitive operations execute on the backend.
