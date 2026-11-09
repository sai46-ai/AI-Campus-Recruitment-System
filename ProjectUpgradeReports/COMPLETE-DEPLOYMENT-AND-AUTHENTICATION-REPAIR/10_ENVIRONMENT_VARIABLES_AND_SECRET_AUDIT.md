# 10 — Environment Variables and Secret Audit

**Scope:** Complete Variable Inventory Across Frontend, Backend, and AI Service
**Policy:** Zero hardcoded secrets; client bundles free of backend credentials

---

## 1. Environment Variable Matrix

| Variable Name | Service | Purpose | Required / Optional | Secret | Default / Example |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `NODE_ENV` | Backend | Runtime mode | Required | No | `production` / `development` |
| `PORT` | Backend | HTTP listening port | Required | No | `10000` on Render (`5000` dev) |
| `CLIENT_URL` | Backend | CORS allowed origin(s) | Required | No | `https://ai-campus-frontend.onrender.com` |
| `ALLOW_VERCEL_PREVIEWS` | Backend | Dynamic Vercel preview branch CORS | Optional | No | `"false"` on Render |
| `MONGODB_URI` | Backend | MongoDB Atlas connection string | Required | **Yes** | `mongodb+srv://...` |
| `JWT_SECRET` | Backend | Access token signing key | Required | **Yes** | 32+ characters random string |
| `JWT_REFRESH_SECRET` | Backend | Refresh token signing key | Required | **Yes** | 32+ characters random string |
| `CSRF_SECRET` | Backend | Double-submit CSRF HMAC key | Required | **Yes** | 32+ characters random string |
| `AI_SERVICE_URL` | Backend | Internal Python service endpoint | Required | No | `ai-campus-ai-service:8000` |
| `UPLOAD_DIR` | Backend | Physical file destination | Required | No | `/var/data/uploads` (`./uploads` dev) |
| `ALLOW_PRODUCTION_SEED` | Backend | Seeds demo accounts if DB empty | Optional | No | `"true"` |
| `ALLOW_DEV_OTP` | Backend | Logs OTPs to console if SMTP unset | Optional | No | `"true"` |
| `GEMINI_API_KEY` | Backend | Google Cloud AI key for Tier 2 LLM | Optional | **Yes** | `AIzaSy...` |
| `REDIS_URL` | Backend | Standalone Redis session cache | Optional | **Yes** | (Unset uses in-memory sessions) |
| `VITE_API_URL` | Frontend | Backend public REST endpoint | Required | No | `https://ai-campus-backend.onrender.com/api/v1` |
| `PORT` | AI Service | FastAPI Uvicorn port | Required | No | `8000` |
| `PYTHON_VERSION` | AI Service | Target Python runtime | Required | No | `3.10.12` |

---

## 2. Security Verification

- **Frontend Bundle Audit:** `frontend/dist` inspected. Contains zero references to `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CSRF_SECRET`, or `GEMINI_API_KEY`.
- **Git Tracking Audit:** `.gitignore` properly excludes `.env`, `.env.local`, `.env.production`, and `uploads/`. No sensitive files are tracked in version control.
