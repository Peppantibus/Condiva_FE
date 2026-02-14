import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { configureApi, type AuthSession, type AuthUser } from '../api/client';
import { login as loginApi, loginWithGoogle as loginWithGoogleApi, logout as logoutApi, refreshSession as refreshSessionApi } from '../api/auth';
import { GoogleLoginRequestDto, LoginRequestDto } from '../api/types';

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequestDto) => Promise<void>;
  loginWithGoogle: (payload: GoogleLoginRequestDto) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LEGACY_AUTH_STORAGE_KEYS = [
  'condiva.auth.accessToken',
  'condiva.auth.refreshToken',
  'condiva.auth.user',
  'condiva_token',
  'condiva_refresh_token',
  'condiva_user',
];

const clearLegacyAuthStorage = () => {
  try {
    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage cleanup errors
  }
};

let bootstrapSessionPromise: Promise<AuthSession | null> | null = null;

const runBootstrapRefresh = (refreshSession: () => Promise<AuthSession | null>) => {
  if (!bootstrapSessionPromise) {
    bootstrapSessionPromise = refreshSession().finally(() => {
      bootstrapSessionPromise = null;
    });
  }
  return bootstrapSessionPromise;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokenState, setTokenState] = useState<string | null>(null);
  const [userState, setUserState] = useState<AuthUser | null>(null);
  const tokenRef = useRef<string | null>(tokenState);
  const csrfTokenRef = useRef<string | null>(null);

  const setSession = useCallback((session: AuthSession | null) => {
    const accessToken = session?.accessToken ?? null;
    const user = session?.user ?? null;
    tokenRef.current = accessToken;
    setTokenState(accessToken);
    setUserState(user);
    if (!session) {
      csrfTokenRef.current = null;
    }
  }, []);

  const setCsrfToken = useCallback((token: string | null) => {
    csrfTokenRef.current = token;
  }, []);

  const login = useCallback(async (payload: LoginRequestDto) => {
    const session = await loginApi(payload);
    setSession(session);
  }, [setSession]);

  const loginWithGoogle = useCallback(async (payload: GoogleLoginRequestDto) => {
    const session = await loginWithGoogleApi(payload);
    setSession(session);
  }, [setSession]);

  const logout = useCallback(() => {
    void logoutApi()
      .catch(() => undefined)
      .finally(() => {
        clearLegacyAuthStorage();
        setSession(null);
        setCsrfToken(null);
      });
  }, [setCsrfToken, setSession]);

  const refreshSession = useCallback(async () => {
    try {
      return await refreshSessionApi();
    } catch {
      return null;
    }
  }, []);

  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    clearLegacyAuthStorage();

    configureApi({
      getAccessToken: () => tokenRef.current,
      getCsrfToken: () => csrfTokenRef.current,
      setCsrfToken,
      setSession,
      refreshSession,
      onUnauthorized: () => {
        clearLegacyAuthStorage();
        setSession(null);
        setCsrfToken(null);
      },
    });

    let cancelled = false;
    const bootstrap = async () => {
      const session = await runBootstrapRefresh(refreshSession);
      if (!cancelled) {
        setSession(session);
        setIsReady(true);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [refreshSession, setCsrfToken, setSession]);

  const value = useMemo(
    () => ({
      token: tokenState,
      user: userState,
      isAuthenticated: Boolean(tokenState || userState),
      login,
      loginWithGoogle,
      logout,
    }),
    [tokenState, userState, login, loginWithGoogle, logout]
  );

  // Wait for cookie-session bootstrap before rendering protected routes.
  if (!isReady) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return ctx;
};
