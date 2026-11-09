# 02 — Complete Error and Root Cause Register

**Project:** AI Campus Recruitment System
**Audit Scope:** Full Investigation of Browser Console Errors, Network Failures, and Deployment Warnings

---

## 1. Defect Register

### Issue ERR-01: React Router Future Flag Warnings
- **Console Log:**
  ```text
  react-router-dom.js:4427
  React Router Future Flag Warning:
  React Router will begin wrapping state updates in React.startTransition in v7.
  You can use the v7_startTransition future flag to opt-in early.

  react-router-dom.js:4427
  React Router Future Flag Warning:
  Relative route resolution within Splat routes is changing in v7.
  You can use the v7_relativeSplatPath future flag to opt-in early.
  ```
- **Severity:** Low (Deprecation warning)
- **Root Cause:** React Router v6.30.4 emits informational console warnings alerting developers to behavioral defaults in React Router v7 regarding concurrent mode transitions and relative route navigation from splat routes.
- **Affected File:** `frontend/src/app/App.tsx`
- **Resolution:** Opted in explicitly via `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` on `<Router>`.
- **Status:** **REPAIRED**

---

### Issue ERR-02: Initial Visit Refresh Token 401
- **Console Log:**
  ```text
  :5000/api/v1/auth/refresh-token:
  Failed to load resource: the server responded with a status of 401 (Unauthorized)
  ```
- **Severity:** Medium (Spurious network error on initial landing page visit)
- **Root Cause:** On application mount, `AuthContext.tsx` unconditionally invoked `executeCoordinatedRefresh()`. When an anonymous visitor with no prior session opened the landing page, the browser sent a cookie-less request to `/auth/refresh-token`, returning an expected 401.
- **Affected File:** `frontend/src/shared/context/AuthContext.tsx`
- **Resolution:** Guarded initial in-memory refresh behind a check for cached user indicators (`safeGetStorage('user')`). Anonymous visitors now bootstrap CSRF without triggering an empty refresh request.
- **Status:** **REPAIRED**

---

### Issue ERR-03: Login Request 403 Forbidden
- **Console Log:**
  ```text
  :5000/api/v1/auth/login:
  Failed to load resource: the server responded with a status of 403 (Forbidden)
  ```
- **Severity:** High (Initial form submission rejected)
- **Root Cause:** Pre-authentication CSRF tokens were not proactively attached to the initial login POST request if the client had not completed a prior GET request. The backend CSRF protection middleware correctly rejected the missing token with 403.
- **Affected File:** `frontend/src/shared/services/api.ts`
- **Resolution:** Added proactive CSRF token bootstrapping in the Axios request interceptor for all state-changing HTTP methods (`POST`, `PUT`, `DELETE`, `PATCH`). If no token is held in memory, `fetchFreshCsrfToken()` is called before dispatching the request.
- **Status:** **REPAIRED**

---

### Issue ERR-04: Login Request 401 Incorrectly Intercepted as Session Expiry
- **Console Log:**
  ```text
  :5000/api/v1/auth/login:
  Failed to load resource: the server responded with a status of 401 (Unauthorized)

  :5000/api/v1/auth/refresh-token:
  Failed to load resource: the server responded with a status of 401 (Unauthorized)

  clientLogger.ts:15
  [WARN] Authentication session expired, redirecting to login
  ```
- **Severity:** High (Credential errors masquerade as session timeouts; recursive refresh loops)
- **Root Cause:** In `frontend/src/shared/services/api.ts`, the global 401 response interceptor did not check the request URL. When a user submitted invalid login credentials, the backend returned 401. The interceptor treated this 401 as an expired JWT access token, triggering `executeCoordinatedRefresh()`, which failed with 401, logged "Authentication session expired, redirecting to login", and redirected to `/login` while overwriting the error message with "Your session has expired. Please sign in again."
- **Affected Files:** `frontend/src/shared/services/api.ts`, `frontend/src/shared/utils/clientLogger.ts`
- **Resolution:** Added `isAuthEndpoint` guard excluding `/auth/login`, `/auth/register`, `/auth/refresh-token`, `/auth/logout`, `/auth/csrf-token`, and `/auth/verify-otp` from 401 interceptor refresh and redirect logic. Login errors now return cleanly to the form for display.
- **Status:** **REPAIRED**

---

### Issue ERR-05: Missing `tsc` During Cloud Build (`sh: line 1: tsc: command not found`)
- **Severity:** High (Cloud deployment failure)
- **Root Cause:** TypeScript is defined in `devDependencies`. When cloud deployment build runners set `NODE_ENV=production` before running `npm install`, npm omits `devDependencies`, leaving `tsc` unavailable during the `build` script.
- **Affected File:** `render.yaml`
- **Resolution:** Configured `buildCommand: npm install --include=dev && npm run build` in `render.yaml` for both frontend and backend services.
- **Status:** **REPAIRED**

---

### Issue ERR-06: Port 5000 Network Origin in Browser
- **Console Log:** `:5000/api/v1/auth/...`
- **Severity:** Informational
- **Root Cause:** In local development, `import.meta.env.VITE_API_URL` defaults to `http://localhost:5000/api/v1`. On Render, `VITE_API_URL` is set to `https://ai-campus-backend.onrender.com/api/v1`.
- **Affected Files:** `frontend/src/shared/services/api.ts`, `frontend/src/shared/services/tokenBroker.ts`
- **Resolution:** Normalized base URL sanitization (stripping trailing slashes) in both files while preserving environment-driven configuration.
- **Status:** **VERIFIED & NORMALIZED**

---

### Issue ERR-07: Authentication Error Triplication on Login Screen
- **UI Display:**
  ```text
  Sign In to Your Workspace
  Enter your institutional credentials to continue
  Invalid email or password

  Institutional Email
  Invalid email or password

  Password
  Invalid email or password
  ```
- **Severity:** High (UI defect causing severe confusion and accessibility violations)
- **Root Cause:** In `frontend/src/features/auth/Login.tsx`, the component received the server error string `"Invalid email or password"`. To conditionally route error messages to inputs, the code used `error?.includes('email') ? error : undefined` and `error?.includes('password') ? error : undefined`. Because the string contained both words, the identical error message was rendered three times (under the header, under email, and under password).
- **Affected Files:** `frontend/src/features/auth/Login.tsx`, `frontend/src/features/auth/Register.tsx`, `frontend/src/shared/components/ui/Input.tsx`
- **Resolution:** Decoupled client-side synchronous field validation (`fieldErrors`) from server-side authentication alerts (`formError`). Server-side failures render once in the dedicated top alert box; field errors render only below their respective inputs upon empty/malformed submission. Added accessible `aria-invalid`, `aria-describedby`, and `<p id={errorId} role="alert">` tags in `Input.tsx`.
- **Status:** **REPAIRED** (Verified with Playwright scenarios 01–07 and archived screenshots)
