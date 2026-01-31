import { ApiClient } from './client/client.api';

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

type AuthHandlers = {
  getAccessToken: () => string | null;
  setTokens: (tokens: AuthTokens | null) => void;
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

let refreshPromise: Promise<AuthTokens | null> | null = null;

type RetryableRequestInit = RequestInit & { __retried?: boolean };

const fetchWithAuth = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const pathname = getPathname(input);
  const isPublic = isPublicEndpoint(pathname);

  const headers = new Headers(init?.headers ?? {});
  const token = authHandlers?.getAccessToken();
  if (!isPublic && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  const alreadyRetried = (init as RetryableRequestInit | undefined)?.__retried ?? false;
  if (!isPublic && !alreadyRetried && (response.status === 401 || response.status === 403)) {
    if (authHandlers?.refreshTokens) {
      if (!refreshPromise) {
        refreshPromise = authHandlers.refreshTokens().finally(() => {
          refreshPromise = null;
        });
      }
      const tokens = await refreshPromise;
      if (tokens?.accessToken) {
        authHandlers.setTokens(tokens);
        const retryHeaders = new Headers(init?.headers ?? {});
        retryHeaders.set('Authorization', `Bearer ${tokens.accessToken}`);
        return fetch(input, {
          ...init,
          headers: retryHeaders,
          __retried: true,
        } as RetryableRequestInit);
      }
    }
    authHandlers?.onUnauthorized?.();
  }

  return response;
};

export const apiClient = new ApiClient(getBaseUrl(), { fetch: fetchWithAuth });
