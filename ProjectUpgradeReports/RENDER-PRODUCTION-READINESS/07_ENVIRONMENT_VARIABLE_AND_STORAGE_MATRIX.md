# Supplementary Report 07: Environment Variable and Storage Matrix

**Project:** AI Campus Recruitment System  
**Repository:** `C:\Projects\AI-CAMPUS-RECRUITMENT-SYSTEM01`  
**Focus:** Production Environment Configuration and Persistent Storage Topology  
**Audit Date:** November 9, 2026  
**Status:** COMPLETE MATRIX AND SPECIFICATION

---

## 1. Environment Variable Master Matrix

### Frontend (`frontend/.env` / Render Static Site Environment)
| Variable | Required | Default / Example | Purpose / Production Guidance |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **YES** | `https://ai-campus-backend.onrender.com/api/v1` | Base URL of the backend API. Baked into the client bundle at build time. |
| `VITE_ENV` | NO | `production` | Environment mode identifier for client telemetry. |
| `VITE_DEBUG` | NO | `false` | Enables verbose console logging in browser devtools. |

---

### Backend (`backend/.env` / Render Web Service Environment)
| Variable | Required | Production Guidance | Security / Generation Rule |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **YES** | `production` | Enforces production error sanitization, JSON logging, and secure cookies. |
| `PORT` | **YES** | `10000` | Port listened to by Express. Render automatically injects this. |
| `API_PREFIX` | NO | `/api/v1` | REST API namespace prefix. |
| `CLIENT_URL` | **YES** | `https://ai-campus-frontend.onrender.com` | Allowed CORS origin. Multiple origins can be comma-separated. |
| `MONGODB_URI` | **YES** | `mongodb+srv://admin:pass@ai-campus-cluster...` | MongoDB Atlas persistent connection string. Set `sync: false` in Render. |
| `MONGODB_TIMEOUT_MS`| NO | `5000` | Socket connection timeout in milliseconds. |
| `JWT_SECRET` | **YES** | 64+ char random string | Access token signing key. Generated automatically by Render Blueprint (`generateValue: true`). |
| `JWT_REFRESH_SECRET`| **YES** | 64+ char random string | Refresh token signing key. Distinct from `JWT_SECRET`. |
| `CSRF_SECRET` | **YES** | 64+ char random string | HMAC secret for CSRF token signatures. |
| `AI_SERVICE_URL` | NO | `http://ai-campus-ai-service:8000` | Internal network URL to Python AI microservice (`fromService` in `render.yaml`). |
| `GEMINI_API_KEY` | NO | User's Google AI Studio Key | Optional Tier 2 AI engine. If omitted, heuristic engine handles parsing. |
| `REQUIRE_GEMINI` | NO | `false` | If true, fails requests on Gemini error rather than using heuristic fallback. |
| `UPLOAD_DIR` | **YES** | `/var/data/uploads` | Path to persistent disk mount directory for resume storage. |
| `MAX_FILE_SIZE` | NO | `10485760` (10MB) | Maximum file size for student resume uploads. |
| `ALLOW_PRODUCTION_SEED`| NO | `true` | Auto-provisions verified demo accounts on startup (admin, student, recruiter, placement). |
| `ALLOW_DEV_OTP` | NO | `true` | Prints OTP codes to server stdout when SMTP is unconfigured. |
| `REDIS_URL` | NO | Empty (Disabled) | Optional Redis URL for distributed sessions. MongoDB used by default. |

---

### AI Service (`ai-service/.env` / Render Private Service Environment)
| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | **YES** | `8000` | FastAPI uvicorn listener port. |
| `HOST` | **YES** | `0.0.0.0` | Network binding interface. |
| `ENV` | NO | `production` | Service environment. |
| `PYTHON_VERSION`| NO | `3.10.12` | Python runtime version pinned in Render. |
| `LOG_LEVEL` | NO | `INFO` | Output verbosity level. |

---

## 2. Storage Topology and Disk Mount Matrix

```
Render Cloud Web Service (ai-campus-backend)
├── Ephemeral Container Filesystem (/app)
│   ├── dist/                 (Compiled TypeScript output)
│   ├── node_modules/         (Production NPM dependencies)
│   └── package.json
│
└── Persistent Disk Mount (/var/data) [render.yaml: disk.name = resume-data]
    └── uploads/
        └── resumes/
            ├── resume-1718293812-4910283.pdf
            └── resume-1718293994-1029384.docx
```

### Storage Persistence Rules:
1. **Container Deploys:** When a new backend commit is pushed, Render creates a new container image. The persistent disk at `/var/data` is automatically unmounted from the previous container and attached to the new container. **Zero files are lost.**
2. **Dynamic Generation Fallback:** If a candidate resume is downloaded but the raw file was created via `ResumeBuilder` (stored only as structured JSON in MongoDB), the backend's dynamic PDF synthesis engine generates a real, valid PDF buffer on-the-fly (`Content-Type: application/pdf`).

