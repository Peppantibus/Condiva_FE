import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { configureApi } from '../api/client';
import { AuthTokens, login as loginApi, refreshToken as refreshTokenApi } from '../api/auth';
import { LoginRequestDto } from '../api/types';

const ACCESS_TOKEN_KEY = 'condiva.auth.accessToken';
const REFRESH_TOKEN_KEY = 'condiva.auth.refreshToken';
const LEGACY_TOKEN_KEY = 'condiva.auth.token';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequestDto) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokenState, setTokenState] = useState<string | null>(
    () => localStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY)
  );
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(
    () => localStorage.getItem(REFRESH_TOKEN_KEY)
  );
  const tokenRef = useRef<string | null>(tokenState);
  const refreshTokenRef = useRef<string | null>(refreshTokenState);

  const setTokens = useCallback((tokens: AuthTokens | null) => {
    const accessToken = tokens?.accessToken ?? null;
    const refreshToken = tokens?.refreshToken ?? null;
    tokenRef.current = accessToken;
    refreshTokenRef.current = refreshToken;
    setTokenState(accessToken);
    setRefreshTokenState(refreshToken);
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, []);

  const login = useCallback(async (payload: LoginRequestDto) => {
    const tokens = await loginApi(payload);
    setTokens(tokens);
  }, [setTokens]);

  const logout = useCallback(() => {
    setTokens(null);
  }, [setTokens]);

  const refreshTokens = useCallback(async () => {
    const refreshToken = refreshTokenRef.current;
    if (!refreshToken) return null;
    try {
      const tokens = await refreshTokenApi({ refreshToken: refreshToken });
      return { ...tokens, refreshToken: tokens.refreshToken ?? refreshToken };
    } catch {
      return null;
    }
  }, []);

  React.useEffect(() => {
    configureApi({
      getAccessToken: () => tokenRef.current,
      setTokens,
      refreshTokens,
      onUnauthorized: () => setTokens(null),
    });
  }, [refreshTokens, setTokens]);

  const value = useMemo(
    () => ({
      token: tokenState,
      isAuthenticated: Boolean(tokenState || refreshTokenState),
      login,
      logout,
    }),
    [tokenState, refreshTokenState, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return ctx;
};
