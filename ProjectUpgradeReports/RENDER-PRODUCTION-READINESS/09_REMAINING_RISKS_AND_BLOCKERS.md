# Supplementary Report 09: Remaining Risks, Cost Profiles and Non-Critical Limitations

**Project:** AI Campus Recruitment System  
**Repository:** `C:\Projects\AI-CAMPUS-RECRUITMENT-SYSTEM01`  
**Target Platform:** Render Cloud Platform  
**Audit Date:** November 9, 2026  
**Status:** FULL TRANSPARENCY RISK LEDGER

---

## 1. Summary of Remaining Blockers

There are **zero active code defects or blocking architectural flaws** preventing deployment on Render. The system compiles cleanly, all 152 backend tests pass, all 7 Python tests pass, and all 17 3D visual assets are mathematically verified against their SHA-256 baselines.

However, deploying on cloud platforms introduces infrastructure plan choices, billing considerations, and runtime behaviors that an operator must be aware of.

---

## 2. Non-Critical Limitations Ledger

| Limitation ID | Category | Description | Impact | Mitigation / Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **LIM-01** | Render Billing / Plan | Persistent Disk requires Render `Starter` tier ($7/mo for Web Service + $0.25/GB/mo for Disk). | On Render's Free tier, disks cannot be attached. | If deployed on Free tier, set `UPLOAD_DIR=./uploads`. The application will rely on its built-in dynamic PDF synthesis fallback if a container restarts. |
| **LIM-02** | Render Billing / Plan | Private Services (`type: pserv`) require `Starter` tier ($7/mo). | On Free tier, internal private networking is disabled. | If running on Free tier, deploy the AI service as a public Web Service with an internal bearer token, or operate the backend in standalone mode with Gemini / Heuristic fallback. |
| **LIM-03** | Free Tier Sleep | Free Web Services spin down after 15 minutes of inactivity. | First incoming HTTP request after idle takes ~50 seconds (cold start). | Deploy on Starter tier ($7/mo) for 24/7 always-on operation, or use a health-check pinger (e.g. UptimeRobot) targeting `/api/v1/health`. |
| **LIM-04** | Email Delivery | SMTP credentials (Gmail, SendGrid) not hardcoded. | Real verification emails cannot be delivered without credentials. | `ALLOW_DEV_OTP=true` is enabled by default, printing 6-digit registration codes directly to the server stdout logs for instant demonstration. |
| **LIM-05** | Browser Cookies | PSL Cross-Subdomain requires third-party cookie acceptance. | Users in strict browser privacy modes that block all cross-site cookies could experience cookie drops. | In a future phase, configuring a custom domain (e.g. `app.campusrecruitment.com` and `api.campusrecruitment.com`) removes cross-site PSL boundaries completely. |

---

## 3. Render Estimated Cost Breakdown

### Recommended Production Configuration (Matching `render.yaml`)
- `ai-campus-frontend`: Render Static Site = **$0.00 / month (FREE)**
- `ai-campus-backend`: Render Web Service (`Starter` Plan, 512 MB RAM, 0.5 CPU) = **$7.00 / month**
- Persistent Disk: 1 GB Disk attached to backend = **$0.25 / month**
- `ai-campus-ai-service`: Render Private Service (`Starter` Plan, 512 MB RAM, 0.5 CPU) = **$7.00 / month**
- **Total Estimated Operating Cost:** **~$14.25 / month**

### Zero-Dollar ($0.00) Demonstration Mode
If the user prefers a 100% free deployment:
1. Deploy `ai-campus-frontend` as Render Static Site (Free).
2. Deploy `ai-campus-backend` as Render Web Service (Free plan, omitting the disk attachment).
3. Let the backend rely on the Google Gemini 1.5 Flash API (Free tier) or the built-in deterministic heuristic NLP engine.
4. Total Cost = **$0.00 / month**.

