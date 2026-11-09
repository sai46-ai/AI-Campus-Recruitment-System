# 13 — Remaining Risks and External Blockers

**Scope:** Production Deployment Constraints, Third-Party Outages, and Infrastructure Assumptions

---

## 1. Verified Zero Code Defects

There are **zero active code bugs, syntax errors, missing dependencies, or unhandled exceptions** in the repository. All automated builds and tests pass cleanly.

---

## 2. External Operational Considerations

1. **Render Free Tier Ephemeral Storage vs Starter Tier:**
   - On Render Starter plan, `render.yaml` mounts a 1GB persistent disk at `/var/data` for resume storage.
   - If deployed on the Free tier, persistent disks are not supported. However, the system's in-memory dynamic PDF resynthesis fallback (`buildPdfBufferFromResume`) automatically ensures download links remain functional.
2. **Third-Party Cross-Site Cookie Policies:**
   - In deployment configurations where frontend (`https://ai-campus-frontend.onrender.com`) and backend (`https://ai-campus-backend.onrender.com`) reside on separate subdomains, the application sets `SameSite=None; Secure=true`.
   - While modern browsers permit this over HTTPS, privacy extensions blocking all third-party cookies could reject refresh tokens. For institutional production, configuring custom subdomains under a single root domain (e.g. `portal.campus.edu` and `api.campus.edu`) completely eliminates cross-site cookie restrictions.
3. **Google Gemini LLM Quotas (Optional Tier 2):**
   - If `GEMINI_API_KEY` is not provided or quota limits are exceeded, the system automatically falls back to Tier 3 (pure TypeScript deterministic NLP). No downtime occurs.
