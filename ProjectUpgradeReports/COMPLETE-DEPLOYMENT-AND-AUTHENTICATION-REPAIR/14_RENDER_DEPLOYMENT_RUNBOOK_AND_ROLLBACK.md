# 14 — Render Deployment Runbook and Rollback

**Platform:** Render Cloud Platform
**Target Services:** `ai-campus-frontend`, `ai-campus-backend`, `ai-campus-ai-service`

---

## 1. Deployment Step-by-Step Procedure

1. **Log in to Render:** Open [https://dashboard.render.com](https://dashboard.render.com).
2. **Create New Blueprint:**
   - Click **New +** (top right) -> **Blueprint**.
   - Connect the repository `sai46-ai/AI-Campus-Recruitment-System`.
   - Render automatically parses `render.yaml` and displays the service plan:
     - `ai-campus-frontend` (Static Site, `./dist`, `npm install --include=dev && npm run build`)
     - `ai-campus-backend` (Node Web Service, Starter tier, 1GB disk `/var/data`)
     - `ai-campus-ai-service` (Python Private Service, Uvicorn on port 8000)
3. **Configure Environment Secrets:**
   - When prompted for unset variables:
     - `MONGODB_URI`: `mongodb+srv://admin:admin123@ai-campus-cluster.36khklu.mongodb.net/?appName=ai-campus-cluster`
     - `GEMINI_API_KEY`: *(Optional)* Enter Google AI Gemini API key if cloud LLM parsing is desired.
4. **Deploy:** Click **Apply**.
   - Render builds and spins up `ai-campus-ai-service`.
   - Render compiles `ai-campus-backend`, runs migrations, and checks `/api/v1/health`.
   - Render builds `ai-campus-frontend` and publishes the static distribution.

---

## 2. Verification Checklist After Deployment

- [ ] Check `ai-campus-backend` logs for `[Server] Server running in [production] mode on port 10000`.
- [ ] Check `ai-campus-backend` logs for `[Database] Connected to MongoDB Atlas cluster`.
- [ ] Check `ai-campus-ai-service` logs for `[STARTUP] FastAPI loaded successfully`.
- [ ] Visit `https://ai-campus-frontend.onrender.com` in a browser.
- [ ] Log in with seeded admin credentials (`admin@campus.edu` / `Password@123`).
- [ ] Confirm 3D WebGL background renders smoothly with zero console warnings.

---

## 3. Rollback Runbook

### Service-Level Instant Rollback
1. Open Render Dashboard -> select the affected service (`ai-campus-backend` or `ai-campus-frontend`).
2. Navigate to **Deploys** in the left sidebar.
3. Locate the previous successful deploy entry.
4. Click the kebab menu (`...`) and select **Rollback to this deploy**.
5. Render immediately reactivates the previous immutable build container.
