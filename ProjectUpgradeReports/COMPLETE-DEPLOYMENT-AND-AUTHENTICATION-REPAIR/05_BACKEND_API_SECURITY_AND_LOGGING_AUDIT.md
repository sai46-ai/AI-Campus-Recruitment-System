# 05 — Backend API Security and Logging Audit

**Subsystem:** Express API, Authentication Middleware, Structured Winston Telemetry
**Components:** `backend/src/app.ts`, `backend/src/routes/*`, `backend/src/shared/middleware/*`

---

## 1. Security Architecture Summary

1. **Authentication Token Isolation:**
   - Access tokens (JWT, 15m expiration) are issued exclusively in response bodies for memory-only storage by the client token broker.
   - Refresh tokens (30d max life, 48h idle sliding timeout) are delivered in `HttpOnly`, `SameSite=None`, `Secure=true` cookies (`__Host-refresh_token` or `refresh_token`).
   - Refresh secrets are hashed with SHA-256 (`hashSecret`) before persistence in MongoDB (`ISession.currentTokenHash`).
   - Token family rotation invalidates the entire family upon detecting replay attacks.
2. **Double-Submit HMAC-SHA256 CSRF Protection:**
   - Pre-auth requests (`/auth/login`, `/auth/register`, `/auth/verify-otp`) require a signed pre-session token bound to the companion cookie `csrf_pre_session` (or `__Host-csrf_pre_session`).
   - Authenticated requests require an auth-scoped CSRF token bound to the active user `sessionId`.
3. **Role-Based Access Control (RBAC):**
   - Four institutional roles: `student`, `recruiter`, `placement_officer`, `admin` (with `super_admin` hierarchy).
   - Horizontal ownership checks: A student can only view/download their own resume; recruiters can only view resumes for candidates who submitted applications to their posted openings.
4. **CORS Allowlist & Origin Validation:**
   - Strict origin validation against `CLIENT_URL` (comma-separated domains).
   - Dynamic Vercel preview support gated behind `ALLOW_VERCEL_PREVIEWS=true`.
   - Unauthorized origins receive HTTP 500 error and are rejected at the edge.

---

## 2. Centralized Structured Logging & Redaction

### Correlation ID Flow
1. Every incoming HTTP request passes through `correlationMiddleware.ts`.
2. Checks for `X-Correlation-ID` header; if absent, generates a unique UUID (`crypto.randomUUID()`).
3. Attaches `req.id` and sets `X-Correlation-ID` on the outgoing HTTP response.
4. Winston logger logs in JSON or structured console format with the correlation ID attached.
5. In AI orchestration (`backend/src/features/ai/pythonAiClient.ts`), the correlation ID is forwarded in outbound HTTP requests to the FastAPI microservice (`headers['X-Correlation-ID'] = correlationId`).

### Sensitive Field Redaction
Passwords, JWTs, refresh tokens, cookie headers, and credit/PII strings are stripped before logs are emitted to console or disk.
