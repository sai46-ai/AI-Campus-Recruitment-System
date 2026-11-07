import axios from 'axios';
import {
  getAccessToken,
  getCsrfToken,
  setCsrfToken,
  clearTokens,
  executeCoordinatedRefresh,
  fetchFreshCsrfToken,
} from './tokenBroker';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach X-CSRF-Token for state-changing requests
  const method = config.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const req = err.config;
    if (!req) return Promise.reject(err);

    // 1. Handle 401 Unauthorized via coordinated in-memory refresh
    if (err.response?.status === 401 && !req._retry) {
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
        clearTokens();
        try {
          localStorage.removeItem('user');
        } catch {}
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        if (refErr?.response?.data) {
          refErr.response.data.message = 'Your session has expired. Please sign in again.';
        }
        return Promise.reject(refErr);
      }
    }

    // 2. Handle 403 Forbidden with CSRF error (stale CSRF recovery)
    if (
      err.response?.status === 403 &&
      !req._csrfRetry &&
      (err.response?.data?.message?.includes('CSRF') || err.response?.data?.message?.includes('csrf'))
    ) {
      req._csrfRetry = true;
      try {
        const freshCsrfToken = await fetchFreshCsrfToken();
        req.headers['X-CSRF-Token'] = freshCsrfToken;
        return api(req);
      } catch {
        // If CSRF recovery fails, propagate original error
      }
    }

    // 3. Handle 429 Too Many Requests with Retry-After backoff
    if (err.response?.status === 429 && !req._cooldownRetry) {
      req._cooldownRetry = true;
      const retryAfter = Number(err.response.headers?.['retry-after'] || 2);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return api(req);
    }

    return Promise.reject(err);
  }
);

export default api;
