# Supplementary Report 04: Authentication, Security and Logging Audit

**Project:** AI Campus Recruitment System  
**Repository:** `C:\Projects\AI-CAMPUS-RECRUITMENT-SYSTEM01`  
**Focus:** Token Lifecycle, CSRF Double-Submit, RBAC, PII Redaction, Correlation  
**Audit Date:** November 9, 2026  
**Status:** COMPLIANT WITH ZERO DISCLOSED VULNERABILITIES

---

## 1. Authentication Architecture

The application enforces strict defense-in-depth security across authentication, authorization, and session persistence:

```
[ Frontend Client ]
       │
       ├── 1. POST /auth/login (with email, password & pre-auth CSRF token)
       │◄── Returns short-lived Access Token in JSON body (15m expiration)
       │    Sets httpOnly Refresh Token cookie (7d expiration, SameSite=None, Secure=true)
       │
       ├── 2. Subsequent API requests (with Authorization: Bearer <accessToken> & X-CSRF-Token)
       │◄── Backend authenticates via JWT verification & validates active session in DB
       │
       └── 3. Token Rotation (POST /auth/refresh-token)
            Reads httpOnly cookie, invalidates old token hash in DB, generates new token pair
```

---

## 2. Security Invariants & Protections

### 1. Cryptographic Refresh Token Rotation
- Refresh tokens are composed of a `sessionId` and a cryptographic `secret` separated by a period: `<sessionId>.<secret>`.
- The database stores only the `SHA-256` HMAC hash of the secret (`currentTokenHash`).
- Upon rotation, the client presents the token, the backend performs a constant-time HMAC comparison (`crypto.timingSafeEqual`), invalidates the old hash, and generates a new secret.
- If a reused refresh token is presented (potential token theft), the backend flags the anomaly and immediately **revokes the entire session**.

### 2. Double-Submit HMAC CSRF Protection
- **Pre-Authentication Phase:** Before logging in, the frontend requests `GET /api/v1/auth/csrf-token`. The server responds with an HMAC-signed token and sets an `httpOnly` companion cookie (`csrf_pre_session` or `__Host-csrf_pre_session`).
- **Post-Authentication Phase:** Authenticated mutations require an active session-bound CSRF token.
- Safe methods (`GET`, `HEAD`, `OPTIONS`) and internal health checks are exempt.

### 3. Role-Based Access Control (RBAC)
- All privileged endpoints enforce role validation via `requireRoles(...)`:
  - `STUDENT`: Upload resume, view jobs, submit applications, track application status.
  - `RECRUITER`: Create job postings, view candidates for own jobs, update candidate stage, schedule interviews. Recruiters cannot access resumes of students who haven't applied to their jobs.
  - `PLACEMENT_OFFICER`: View college-wide placement statistics, generate placement reports, export verified CSVs.
  - `ADMIN` / `SUPER_ADMIN`: Manage users, verify recruiter accounts, configure system policies.

---

## 3. Centralized Structured Logging & Request Correlation

### End-to-End Tracing (`X-Correlation-ID`)
- The backend mounts `correlationMiddleware` which either preserves an incoming `X-Correlation-ID` header (from client or edge reverse proxy) or generates a cryptographically random UUIDv4.
- The `X-Correlation-ID` response header is exposed to the browser via CORS (`exposedHeaders: ['X-Correlation-ID']`).
- When the backend invokes the Python AI microservice, it forwards the correlation ID in the HTTP headers.
- All Winston log entries in production format as single-line JSON with timestamp, log level, correlation ID, and message.

### Recursive PII Redaction
To protect candidate privacy and comply with data protection regulations, all log payloads are filtered through a recursive sanitization sanitizer that masks sensitive fields:
- `password`
- `token`, `accessToken`, `refreshToken`, `csrfToken`
- `authorization`
- `secret`
- `creditCard`
- `ssn`

---

## 4. Test Evidence (Security Subphase Suites)

```
PASS tests/security_subphase31_foundations.test.ts (6.224 s)
  Sub-Phase 3.1: Cryptographic Foundations & Defense-in-Depth
    √ enforces minimum secret length (>= 32 chars)
    √ verifies access token signature and expiration
    √ rejects forged and tampered tokens

PASS tests/security_subphase32_session_refresh.test.ts (5.568 s)
  Sub-Phase 3.2: Secure Session Engine and Refresh Rotation
    √ creates active session in MongoDB
    √ successfully rotates refresh token on valid request
    √ detects token reuse and revokes session

PASS tests/security_subphase33_csrf_crypto.test.ts (4.891 s)
  Sub-Phase 3.3: Cryptographic CSRF Engine
    √ generates valid pre-auth HMAC CSRF tokens
    √ validates companion cookie match
    √ rejects expired or tampered CSRF tokens

PASS tests/security_subphase34_routes_auth.test.ts (7.327 s)
  Sub-Phase 3.4: Route Level Authorization and Session Enforcement
    √ prevents unauthenticated access to protected routes
    √ enforces role restrictions (e.g. Student cannot access Recruiter dashboard)
    √ invalidates credentials immediately upon password change or account deactivation

PASS tests/security.regression.test.ts (8.112 s)
  Full Security Regression Matrix
    √ verifies CORS protection against untrusted origins
    √ blocks brute-force authentication attacks via rate limiting
    √ sanitizes error payloads preventing stack trace leakage in production
```

