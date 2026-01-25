export type ApiErrorPayload = {
  error?: string | { code?: string; message?: string };
  code?: string;
  field?: string;
  entity?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  field?: string;
  entity?: string;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.status = status;
    this.code = payload?.code;
    this.field = payload?.field;
    this.entity = payload?.entity;
  }
}

type AuthTokens = {
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

const buildQuery = (query?: Record<string, string | number | boolean | null | undefined>) => {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
};

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  auth?: boolean;
  retried?: boolean;
};

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}${buildQuery(options.query)}`;
  const headers: Record<string, string> = {};

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const token = authHandlers?.getAccessToken();
  if (options.auth !== false && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body,
  });

  if (response.status === 401 && options.auth !== false && !options.retried) {
    if (authHandlers?.refreshTokens) {
      const tokens = await authHandlers.refreshTokens();
      if (tokens?.accessToken) {
        authHandlers.setTokens(tokens);
        return request<T>(path, { ...options, retried: true });
      }
    }
    authHandlers?.onUnauthorized?.();
  }

  if (!response.ok) {
    const payload = (await parseResponse(response)) as ApiErrorPayload;
    let message: string;
    let code: string | undefined;

    if (payload?.error && typeof payload.error === 'object') {
      // New envelope format: { error: { code: "...", message: "..." } }
      message = payload.error.message || response.statusText || 'Request failed.';
      code = payload.error.code;
    } else {
      // Old format or simple string error
      message = (typeof payload?.error === 'string' ? payload.error : null) || response.statusText || 'Request failed.';
      code = payload?.code;
    }

    throw new ApiError(response.status, message, { ...payload, code });
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await parseResponse(response)) as T;
};

export const api = {
  get: <T>(path: string, query?: RequestOptions['query'], auth = true) =>
    request<T>(path, { method: 'GET', query, auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'PUT', body, auth }),
  del: <T>(path: string, auth = true) =>
    request<T>(path, { method: 'DELETE', auth }),
};
