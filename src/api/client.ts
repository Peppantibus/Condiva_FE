import { ApiClient } from './client/client.api';

export type AuthUser = {
  id?: string | null;
  username?: string | null;
  name?: string | null;
  lastName?: string | null;
};

export type AuthSession = {
  accessToken?: string | null;
  user?: AuthUser | null;
};

export type AuthTokens = AuthSession & {
  refreshToken?: string | null;
};

type AuthHandlers = {
  getAccessToken: () => string | null;
  getCsrfToken?: () => string | null;
  setCsrfToken?: (token: string | null) => void;
  setSession?: (session: AuthSession | null) => void;
  refreshSession?: () => Promise<AuthSession | null>;
  setTokens?: (tokens: AuthTokens | null) => void;
  refreshTokens?: () => Promise<AuthTokens | null>;
  onUnauthorized?: () => void;
};

let authHandlers: AuthHandlers | null = null;

export const configureApi = (handlers: AuthHandlers) => {
  authHandlers = handlers;
};

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return envUrl && envUrl.trim().length > 0 ? envUrl : 'https://<host>';
};

const getPathname = (input: RequestInfo) => {
  const rawUrl = typeof input === 'string' ? input : input.url;
  try {
    return new URL(rawUrl, getBaseUrl()).pathname;
  } catch {
    return rawUrl;
  }
};

const isPublicEndpoint = (pathname: string) => pathname.startsWith('/api/auth');
const isStateChangingMethod = (method?: string) => {
  const normalizedMethod = (method ?? 'GET').toUpperCase();
  return normalizedMethod === 'POST'
    || normalizedMethod === 'PUT'
    || normalizedMethod === 'PATCH'
    || normalizedMethod === 'DELETE';
};
const CSRF_HEADER = 'X-CSRF-Token';

let refreshPromise: Promise<AuthSession | null> | null = null;

type RetryableRequestInit = RequestInit & { __retried?: boolean };

const fetchWithAuth = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const pathname = getPathname(input);
  const isPublic = isPublicEndpoint(pathname);
  const handlers = authHandlers;

  const headers = new Headers(init?.headers ?? {});
  const csrfToken = handlers?.getCsrfToken?.();
  if (isStateChangingMethod(init?.method) && csrfToken) {
    headers.set(CSRF_HEADER, csrfToken);
  }

  const token = handlers?.getAccessToken?.();
  if (!isPublic && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  const nextCsrfToken = response.headers.get(CSRF_HEADER);
  if (nextCsrfToken) {
    handlers?.setCsrfToken?.(nextCsrfToken);
  }

  const alreadyRetried = (init as RetryableRequestInit | undefined)?.__retried ?? false;
  if (!isPublic && !alreadyRetried && response.status === 401) {
    const refreshSessionHandler = handlers?.refreshSession;
    const refreshTokensHandler = handlers?.refreshTokens;
    const refreshSession = refreshSessionHandler
      ? () => refreshSessionHandler()
      : refreshTokensHandler
        ? () => refreshTokensHandler()
        : null;

    if (refreshSession) {
      if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
          refreshPromise = null;
        });
      }
      const session = await refreshPromise;
      if (session) {
        if (handlers?.setSession) {
          handlers.setSession(session);
        } else if (handlers?.setTokens) {
          handlers.setTokens(session);
        }
        const retryHeaders = new Headers(init?.headers ?? {});
        const retryCsrfToken = handlers?.getCsrfToken?.();
        if (isStateChangingMethod(init?.method) && retryCsrfToken) {
          retryHeaders.set(CSRF_HEADER, retryCsrfToken);
        }

        const retryToken = session.accessToken ?? handlers?.getAccessToken?.();
        if (retryToken) {
          retryHeaders.set('Authorization', `Bearer ${retryToken}`);
        }

        return fetch(input, {
          ...init,
          headers: retryHeaders,
          credentials: 'include',
          __retried: true,
        } as RetryableRequestInit);
      }
    }
    authHandlers?.onUnauthorized?.();
  }

  return response;
};

export const apiClient = new ApiClient(getBaseUrl(), { fetch: fetchWithAuth });
