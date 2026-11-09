# Supplementary Report 05: Render Three-Service Configuration

**Project:** AI Campus Recruitment System  
**Repository:** `C:\Projects\AI-CAMPUS-RECRUITMENT-SYSTEM01`  
**Configuration File:** `render.yaml` (Repository Root)  
**Audit Date:** November 9, 2026  
**Status:** VALIDATED INFRASTRUCTURE-AS-CODE SPECIFICATION

---

## 1. Blueprint Overview

The complete application is codified in a single Render Blueprint specification located at `render.yaml`. This enables zero-touch, reproducible provisioning across development, staging, and production environments.

The architecture provisions three interconnected services:
1. `ai-campus-frontend` (Static Site)
2. `ai-campus-backend` (Web Service)
3. `ai-campus-ai-service` (Private Service)

---

## 2. Service Specifications

### Service 1: `ai-campus-frontend`
- **Type:** Static Site (`type: web`, `runtime: static`)
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `./dist`
- **Routing Rules:** SPA rewrite rule (`/* -> /index.html`) ensures that client-side React routes (`/jobs`, `/dashboard`, `/login`) resolve without 404 errors.
- **Environment Variables:**
  - `VITE_API_URL`: Points to the public backend API endpoint (`https://ai-campus-backend.onrender.com/api/v1`).

### Service 2: `ai-campus-backend`
- **Type:** Web Service (`type: web`, `runtime: node`)
- **Plan:** `starter` (Required for persistent disk attachment)
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/v1/health`
- **Disk Attachment:**
  - Name: `resume-data`
  - Mount Path: `/var/data`
  - Size: 1 GB (scalable via dashboard)
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `CLIENT_URL`: `https://ai-campus-frontend.onrender.com`
  - `MONGODB_URI`: Provided securely by operator via Render dashboard (`sync: false`)
  - `JWT_SECRET`: Auto-generated 256-bit cryptographically secure string (`generateValue: true`)
  - `JWT_REFRESH_SECRET`: Auto-generated secure string (`generateValue: true`)
  - `CSRF_SECRET`: Auto-generated secure string (`generateValue: true`)
  - `AI_SERVICE_URL`: Dynamic resolution from private service:
    ```yaml
    fromService:
      type: pserv
      name: ai-campus-ai-service
      property: hostAndPort
    ```
  - `UPLOAD_DIR`: `/var/data/uploads`
  - `ALLOW_PRODUCTION_SEED`: `"true"` (Initializes demo roles on clean start)
  - `ALLOW_DEV_OTP`: `"true"` (Facilitates instant live demonstration)

### Service 3: `ai-campus-ai-service`
- **Type:** Private Service (`type: pserv`, `runtime: python`)
- **Plan:** `starter`
- **Root Directory:** `ai-service`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
- **Network Scope:** Isolated from public internet; reachable only by services inside the Render private network over internal DNS (`ai-campus-ai-service:8000`).
- **Environment Variables:**
  - `PORT`: `8000`
  - `PYTHON_VERSION`: `3.10.12`

---

## 3. Persistent Storage and In-Memory Fallbacks

| Data Type | Primary Storage Location | Fallback Mechanism | Data Retention Behavior |
| :--- | :--- | :--- | :--- |
| **Resumes (Uploaded Files)** | `/var/data/uploads/resumes/` on Render Persistent Disk | Dynamic PDF Generator from MongoDB Resume Schema | Retained across container rebuilds and deploys via persistent disk mount |
| **User Data & Profiles** | MongoDB Atlas Cluster | In-Memory MongoDB (Dev test only) | Permanently persisted in managed Atlas database |
| **Sessions & Refresh Tokens** | MongoDB `sessions` collection | In-Memory collection | Preserved across restarts, enabling zero-session-drop rolling deploys |
| **In-Memory Rate Limiting** | Node.js process memory | MemoryStore | Resets on restart (no negative impact on user state) |

---

## 4. Blueprint Source File

```yaml
services:
  - type: web
    name: ai-campus-frontend
    runtime: static
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://ai-campus-backend.onrender.com/api/v1

  - type: web
    name: ai-campus-backend
    runtime: node
    rootDir: backend
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/v1/health
    disk:
      name: resume-data
      mountPath: /var/data
      sizeGB: 1
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: CLIENT_URL
        value: https://ai-campus-frontend.onrender.com
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: CSRF_SECRET
        generateValue: true
      - key: AI_SERVICE_URL
        fromService:
          type: pserv
          name: ai-campus-ai-service
          property: hostAndPort
      - key: UPLOAD_DIR
        value: /var/data/uploads
      - key: ALLOW_PRODUCTION_SEED
        value: "true"
      - key: ALLOW_DEV_OTP
        value: "true"
      - key: GEMINI_API_KEY
        sync: false

  - type: pserv
    name: ai-campus-ai-service
    runtime: python
    rootDir: ai-service
    plan: starter
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port 8000
    envVars:
      - key: PORT
        value: 8000
      - key: PYTHON_VERSION
        value: 3.10.12
```

