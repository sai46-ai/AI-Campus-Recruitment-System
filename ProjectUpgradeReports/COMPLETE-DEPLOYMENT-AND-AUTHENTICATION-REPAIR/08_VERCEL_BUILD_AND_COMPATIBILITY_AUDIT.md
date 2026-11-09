# 08 — Vercel Build and Compatibility Audit

**Status:** Diagnostic and Compatibility Audit Only (Not Target Deployment Platform)
**Target Platform:** Render Cloud Platform

---

## 1. Audit of Current Vercel Integration

### Why Vercel Builds Trigger
The GitHub repository `sai46-ai/AI-Campus-Recruitment-System` is connected to a Vercel project via the Vercel GitHub App. Whenever commits are pushed to the `main` branch, Vercel initiates an automated webhook build.

### Diagnostic Analysis of Previous Vercel Failures
1. **Root Directory Misconfiguration:**
   - If Vercel defaults to repository root (`./`), it attempts to inspect `package.json` at root.
   - The root directory is a monorepo container; the frontend package lives at `frontend/`.
2. **Missing `tsc` During Build:**
   - If Vercel executes with `NODE_ENV=production`, `devDependencies` were skipped, leaving `tsc` missing for `npm run build`.
3. **Resolution for Vercel Compatibility:**
   - Created `frontend/vercel.json` with SPA routing and API reverse-proxying.
   - Created root `vercel.json` with `buildCommand: "npm --prefix frontend run build"`, `outputDirectory: "frontend/dist"`.
   - The frontend builds cleanly on Vite 5 with zero TypeScript errors.

---

## 2. Procedure to Disconnect GitHub from Vercel

If the operator wishes to stop Vercel from triggering builds on future repository commits:

1. Open the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on the project name corresponding to `AI-Campus-Recruitment-System`.
3. Navigate to **Settings** (top navigation tab) -> **Git** (left sidebar).
4. Locate the section labeled **Connected Git Repository** showing `sai46-ai/AI-Campus-Recruitment-System`.
5. Click the **Disconnect** button.
6. Confirm disconnection.
7. Vercel will immediately cease receiving GitHub webhooks or building branch pushes.
