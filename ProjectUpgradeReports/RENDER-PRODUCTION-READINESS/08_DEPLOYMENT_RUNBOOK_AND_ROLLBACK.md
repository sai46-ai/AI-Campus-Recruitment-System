# Supplementary Report 08: Deployment Runbook and Rollback Strategy

**Project:** AI Campus Recruitment System  
**Repository:** `C:\Projects\AI-CAMPUS-RECRUITMENT-SYSTEM01`  
**Target Platform:** Render Cloud Platform  
**Audit Date:** November 9, 2026  
**Status:** STEP-BY-STEP OPERATIONAL RUNBOOK

---

## 1. Prerequisites for Deployment

Before deploying on Render, ensure you have:
1. A Render Account ([render.com](https://render.com)).
2. A GitHub account with access to `https://github.com/sai46-ai/AI-Campus-Recruitment-System`.
3. A MongoDB Atlas cluster connection string (`mongodb+srv://...`).
4. (Optional) A Google AI Studio Gemini API Key.

---

## 2. Step-by-Step Initial Deployment via Render Blueprint

### Step 1: Connect GitHub Repository
1. Log in to your Render Dashboard.
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Select your GitHub repository: `sai46-ai/AI-Campus-Recruitment-System` on branch `main`.

### Step 2: Review Service Declarations
Render will automatically detect `render.yaml` in the root directory and display the three services:
1. `ai-campus-frontend` (Static Site)
2. `ai-campus-backend` (Web Service, Starter Plan, 1 GB Persistent Disk)
3. `ai-campus-ai-service` (Private Service, Starter Plan)

### Step 3: Enter Required Environment Variables
During blueprint setup, Render will prompt for variables with `sync: false`:
1. **`MONGODB_URI`** (under `ai-campus-backend`):
   Paste your MongoDB Atlas connection string (e.g., `mongodb+srv://admin:password@cluster.mongodb.net/ai_campus?retryWrites=true&w=majority`).
2. **`GEMINI_API_KEY`** (Optional, under `ai-campus-backend`):
   Paste your Gemini API key or leave blank to utilize the built-in deterministic heuristic fallback.

### Step 4: Click Apply
Render will initiate parallel builds for the three services:
- `ai-campus-ai-service` builds Python dependencies (`pip install -r requirements.txt`) and launches on port 8000.
- `ai-campus-backend` builds TypeScript (`npm run build`), attaches the 1 GB persistent disk to `/var/data`, seeds default demo accounts, and passes the `/api/v1/health` check.
- `ai-campus-frontend` compiles the Vite bundle and serves static assets globally via CDN.

---

## 3. Post-Deployment Verification (Smoke Testing)

Perform the following health checks once all services report `Live`:

### Check 1: Backend Health & Diagnostics
Visit: `https://ai-campus-backend.onrender.com/api/v1/health`
Expected Response:
```json
{
  "status": "healthy",
  "uptime": 12.4,
  "timestamp": "2026-11-09T10:45:00.000Z",
  "database": "connected",
  "environment": "production"
}
```

### Check 2: AI Engine Diagnostics
Visit: `https://ai-campus-backend.onrender.com/api/v1/ai/diagnostics`
Expected Response:
```json
{
  "status": "operational",
  "pythonEngine": {
    "available": true,
    "configured": true,
    "latencyMs": 42
  },
  "geminiProvider": {
    "configured": true,
    "model": "gemini-1.5-flash"
  }
}
```

### Check 3: Web Application & 3D Interactive World
1. Open `https://ai-campus-frontend.onrender.com` in a desktop browser.
2. Verify the 3D procedural landscape renders smoothly with mouse camera controls.
3. Test login with one of the pre-seeded demo accounts:
   - **Student:** `student@campus.edu` / `StudentPass123!`
   - **Recruiter:** `recruiter@techcorp.com` / `RecruiterPass123!`
   - **Placement Officer:** `placement@campus.edu` / `PlacementPass123!`
   - **Admin:** `admin@campus.edu` / `AdminPass123!`
4. Verify resume upload and ATS score evaluation in the Student portal.

---

## 4. Rollback and Disaster Recovery Procedure

### Scenario A: Code Regression on Recent Commit
1. Go to the Render Dashboard and click on the affected service (`ai-campus-backend` or `ai-campus-frontend`).
2. Navigate to the **Deploys** tab.
3. Locate the last known good deploy.
4. Click the three dots (`...`) next to that deploy and select **Rollback to this deploy**.
5. Render immediately switches traffic back to the prior container image without downtime.

### Scenario B: AI Microservice Disruption
- If `ai-campus-ai-service` crashes or exceeds memory limits, the backend automatically fails over to the Gemini API or the built-in deterministic heuristic parser.
- User requests **do not fail**.
- To restart the AI service: in Render Dashboard, click `ai-campus-ai-service` -> **Manual Deploy** -> **Clear build cache & deploy**.

### Scenario C: Persistent Disk Failure / Data Recovery
- Student resume structured data is perpetually stored in the MongoDB Atlas replica set.
- Even in the event of persistent disk corruption, all candidate profiles, parsed resumes, job applications, and interview records remain safe.
- Downloading any resume triggers the dynamic PDF generation engine, ensuring resume delivery never breaks.

