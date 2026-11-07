/**
 * Phase 06B — Token Broker & Coordinated Multi-Tab Session Manager
 *
 * Architecture Invariants:
 * 1. Tokens (Access Token & CSRF Token) are stored exclusively IN MEMORY.
 *    Never written to localStorage, sessionStorage, indexedDB, or URLs.
 * 2. BroadcastChannel is restricted strictly to non-secret lifecycle notifications ({ type: 'AUTH_LOGOUT' }).
 *    Zero secrets or tokens are ever broadcasted across tabs.
 * 3. Serialization: All cookie-mutating operations (refresh, activity, login, logout) are serialized:
 *    - In SharedWorker mode: via in-memory serialized command queue.
 *    - In Fallback mode: via Web Locks API (navigator.locks.request('auth_cookie_mutation_lock')).
 * 4. Stale CSRF recovery: Re-bootstraps via GET /api/v1/auth/csrf-token on 403 recovery.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');

// In-memory token storage (per-window / per-tab memory)
let inMemoryAccessToken: string | null = null;
let inMemoryCsrfToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

// Lifecycle broadcast channel (no secrets)
let lifecycleChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    lifecycleChannel = new BroadcastChannel('campus_recruitment_auth_lifecycle');
    lifecycleChannel.onmessage = (event) => {
      if (event.data?.type === 'AUTH_LOGOUT') {
        inMemoryAccessToken = null;
        inMemoryCsrfToken = null;
        window.dispatchEvent(new CustomEvent('auth:logout_event'));
      }
    };
  }
} catch {
  // BroadcastChannel unavailable or restricted
}

export const getAccessToken = (): string | null => inMemoryAccessToken;

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const getCsrfToken = (): string | null => inMemoryCsrfToken;

export const setCsrfToken = (token: string | null): void => {
  inMemoryCsrfToken = token;
};

export const clearTokens = (): void => {
  inMemoryAccessToken = null;
  inMemoryCsrfToken = null;
  if (lifecycleChannel) {
    try {
      lifecycleChannel.postMessage({ type: 'AUTH_LOGOUT' });
    } catch {}
  }
};

/**
 * Fetch fresh CSRF token from bootstrap endpoint (GET /api/v1/auth/csrf-token)
 */
export const fetchFreshCsrfToken = async (): Promise<string> => {
  const response = await axios.get(`${API_BASE}/auth/csrf-token`, {
    withCredentials: true,
    headers: inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {},
  });
  const token = response.data?.csrfToken;
  if (token) {
    inMemoryCsrfToken = token;
  }
  return token || '';
};

/**
 * Coordinated Refresh Mutation
 * Uses Web Locks when available to ensure exactly one tab executes cookie rotation at a time.
 */
export const executeCoordinatedRefresh = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const runRefresh = async (): Promise<string> => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const newAccessToken = response.data?.data?.accessToken;
      const newCsrfToken = response.data?.data?.csrfToken;

      if (!newAccessToken) {
        throw new Error('Refresh response missing access token');
      }

      inMemoryAccessToken = newAccessToken;
      if (newCsrfToken) {
        inMemoryCsrfToken = newCsrfToken;
      }
      return newAccessToken;
    } catch (err: any) {
      if (err.response?.status === 429) {
        // Cooldown backoff
        const retrySec = Number(err.response.headers?.['retry-after'] || 2);
        await new Promise((res) => setTimeout(res, retrySec * 1000));
        // If another tab completed refresh during the wait, return its token if available
        if (inMemoryAccessToken) return inMemoryAccessToken;
        // Retry refresh once cooldown passes
        try {
          const retryRes = await axios.post(
            `${API_BASE}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          const newAccessToken = retryRes.data?.data?.accessToken;
          const newCsrfToken = retryRes.data?.data?.csrfToken;
          if (newAccessToken) {
            inMemoryAccessToken = newAccessToken;
            if (newCsrfToken) inMemoryCsrfToken = newCsrfToken;
            return newAccessToken;
          }
        } catch (retryErr) {
          clearTokens();
          throw retryErr;
        }
      }
      clearTokens();
      throw err;
    } finally {
      refreshPromise = null;
    }
  };

  // If Web Locks API is supported, serialize across tabs
  if (typeof navigator !== 'undefined' && 'locks' in navigator && navigator.locks?.request) {
    refreshPromise = (navigator.locks.request('auth_cookie_mutation_lock', () => runRefresh()) as unknown) as Promise<string>;
  } else {
    // Single tab fallback
    refreshPromise = runRefresh();
  }

  return refreshPromise;
};

/**
 * Coordinated Session Activity Ping
 * Extends the 48-hour idle timeout on server without rotating the refresh secret.
 */
export const executeCoordinatedActivity = async (): Promise<void> => {
  // Prevent calling activity if no session is in memory
  if (!inMemoryAccessToken) return;

  const runActivity = async (): Promise<void> => {
    try {
      await axios.post(
        `${API_BASE}/auth/activity`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${inMemoryAccessToken}`,
            ...(inMemoryCsrfToken ? { 'X-CSRF-Token': inMemoryCsrfToken } : {}),
          },
        }
      );
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Stale CSRF recovery
        await fetchFreshCsrfToken();
      }
    }
  };

  if (typeof navigator !== 'undefined' && 'locks' in navigator && navigator.locks?.request) {
    await navigator.locks.request('auth_cookie_mutation_lock', async () => {
      await runActivity();
    });
  } else {
    await runActivity();
  }
};
