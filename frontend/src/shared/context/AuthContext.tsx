import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import {
  getAccessToken,
  setAccessToken as setBrokerToken,
  setCsrfToken,
  clearTokens,
  executeCoordinatedRefresh,
  fetchFreshCsrfToken,
} from '../services/tokenBroker';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string, csrfToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

function safeGetStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function safeRemoveStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const s = safeGetStorage('user');
    try {
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from HttpOnly refresh cookie on page load
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Bootstrap CSRF token
        await fetchFreshCsrfToken().catch(() => {});

        // Attempt in-memory refresh from HttpOnly cookie
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

    // Listen for multi-tab logout events
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
      safeRemoveStorage('user');
      safeRemoveStorage('accessToken');
    };

    window.addEventListener('auth:logout_event', handleLogoutEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:logout_event', handleLogoutEvent);
    };
  }, []);

  const login = (userData: User, token: string, csrf?: string) => {
    setUser(userData);
    setAccessToken(token);
    setBrokerToken(token);
    if (csrf) {
      setCsrfToken(csrf);
    }
    safeSetStorage('user', JSON.stringify(userData));
    // Proactively remove any legacy accessToken from localStorage
    safeRemoveStorage('accessToken');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {} finally {
      setUser(null);
      setAccessToken(null);
      clearTokens();
      safeRemoveStorage('user');
      safeRemoveStorage('accessToken');
    }
  };

  const updateUser = (upd: Partial<User>) => {
    if (user) {
      const n = { ...user, ...upd };
      setUser(n);
      safeSetStorage('user', JSON.stringify(n));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
};
