import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { configureApi, type AuthSession, type AuthUser } from '../api/client';
import { login as loginApi, logout as logoutApi, refreshSession as refreshSessionApi } from '../api/auth';
import { LoginRequestDto } from '../api/types';

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequestDto) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

  const logout = useCallback(() => {
    void logoutApi()
      .catch(() => undefined)
      .finally(() => {
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
    configureApi({
      getAccessToken: () => tokenRef.current,
      getCsrfToken: () => csrfTokenRef.current,
      setCsrfToken,
      setSession,
      refreshSession,
      onUnauthorized: () => {
        setSession(null);
        setCsrfToken(null);
      },
    });

    let cancelled = false;
    const bootstrap = async () => {
      const session = await refreshSession();
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
      logout,
    }),
    [tokenState, userState, login, logout]
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
