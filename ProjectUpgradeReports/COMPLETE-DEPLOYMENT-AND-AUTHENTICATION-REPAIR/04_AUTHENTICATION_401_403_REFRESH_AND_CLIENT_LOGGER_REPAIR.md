# 04 — Authentication 401, 403, Refresh and Client Logger Repair

**Subsystem:** Session Lifecycle, Double-Submit CSRF, Token Broker, Interceptors
**Files Audited:**
- `frontend/src/shared/services/api.ts`
- `frontend/src/shared/services/tokenBroker.ts`
- `frontend/src/shared/context/AuthContext.tsx`
- `frontend/src/shared/utils/clientLogger.ts`
- `backend/src/shared/middleware/csrfMiddleware.ts`

---

## 1. Authentication Lifecycle Diagram

```text
Visitor Opens Page
       │
       ▼
AuthContext.initAuth()
       │
       ├─► Fetch Pre-Auth CSRF Token: GET /auth/csrf-token
       │   └── Sets companion cookie: csrf_pre_session
       │   └── Stores wire token: inMemoryCsrfToken
       │
       ├─► Check Cached Session Indicator: safeGetStorage('user')
       │   │
       │   ├── [Case A: No Prior User] (Anonymous Visitor)
       │   │   └── Do NOT call refresh-token
       │   │   └── Set isLoading: false (Clean initial render, ZERO 401 logs)
       │   │
       │   └── [Case B: Prior User Exists] (Returning User)
       │       └── executeCoordinatedRefresh() -> POST /auth/refresh-token
       │           ├── [Success] -> Restore access token in memory, fetch /auth/me
       │           └── [Expired] -> Clean up local state, set user: null
       │
User Submits Login Form (POST /auth/login)
       │
       ▼
Axios Request Interceptor
       │
       ├─► Ensures X-CSRF-Token is attached (proactively fetched if missing)
       │   └── Zero 403 CSRF rejections
       │
       ▼
Express Backend (POST /auth/login)
       │
       ├── [Valid Credentials]
       │   └── Returns JWT access token (in memory)
       │   └── Returns HttpOnly refresh token cookie
       │   └── Returns fresh authenticated CSRF token
       │
       └── [Invalid Credentials]
           └── Returns 401 Unauthorized ("Invalid email or password")
                   │
                   ▼
Axios Response Interceptor
       │
       ├── Is Auth Endpoint (/auth/login)?
       │   ├── YES -> Bypass 401 refresh handler!
       │   │          Do NOT invoke executeCoordinatedRefresh()
       │   │          Do NOT log "Authentication session expired"
       │   │          Do NOT redirect to /login
       │   │          Reject cleanly to Login.tsx -> Displays "Invalid credentials"
       │   │
       │   └── NO (Protected API route like /profile or /resumes)
       │       └── Execute coordinated refresh
       │           ├── [Success] -> Replay original request
       │           └── [Failure] -> Log session expired only if had prior session
```

---

## 2. Code Changes Applied

### A. Proactive CSRF Attachment & URL Normalization (`api.ts`)
```typescript
const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');

api.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach X-CSRF-Token for state-changing requests, proactively bootstrapping if absent
  const method = config.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    let csrfToken = getCsrfToken();
    if (!csrfToken) {
      try {
        csrfToken = await fetchFreshCsrfToken();
      } catch {}
    }
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});
```

### B. Route-Aware 401 Interceptor (`api.ts`)
```typescript
const url = req.url || '';
const isAuthEndpoint =
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/refresh-token') ||
  url.includes('/auth/logout') ||
  url.includes('/auth/csrf-token') ||
  url.includes('/auth/verify-otp');

// 1. Handle 401 Unauthorized via coordinated in-memory refresh on protected endpoints only
if (err.response?.status === 401 && !req._retry && !isAuthEndpoint) {
  req._retry = true;
  try {
    const freshAccessToken = await executeCoordinatedRefresh();
    req.headers.Authorization = `Bearer ${freshAccessToken}`;
    const freshCsrf = getCsrfToken();
    if (freshCsrf) {
      req.headers['X-CSRF-Token'] = freshCsrf;
    }
    return api(req);
  } catch (refErr: any) {
    const hadSession = !!getAccessToken() || !!localStorage.getItem('user');
    clearTokens();
    try {
      localStorage.removeItem('user');
    } catch {}
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      if (hadSession) {
        clientLogger.warn('Authentication session expired, redirecting to login');
      }
      window.location.href = '/login';
    }
    if (refErr?.response?.data) {
      refErr.response.data.message = 'Your session has expired. Please sign in again.';
    }
    return Promise.reject(refErr);
  }
}
```

### C. Session-Aware Initial Mount (`AuthContext.tsx`)
```typescript
useEffect(() => {
  let isMounted = true;

  const initAuth = async () => {
    try {
      // Bootstrap pre-auth CSRF token for forms
      await fetchFreshCsrfToken().catch(() => {});

      // Only attempt refresh if a prior session indicator exists in local cache
      const hasCachedSession = !!safeGetStorage('user');
      if (hasCachedSession) {
        const token = await executeCoordinatedRefresh();
        if (isMounted && token) {
          setAccessToken(token);
          setBrokerToken(token);
          const meRes = await api.get('/auth/me');
          if (isMounted && meRes.data?.data) {
            setUser(meRes.data.data);
            safeSetStorage('user', JSON.stringify(meRes.data.data));
          }
        }
      }
    } catch {
      if (isMounted) {
        setUser(null);
        setAccessToken(null);
        clearTokens();
        safeRemoveStorage('user');
        safeRemoveStorage('accessToken');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  initAuth();
  // ...
}, []);
```
