import { api } from './client';
import {
  LoginRequestDto,
  RegisterRequestDto,
  RecoveryRequestDto,
  ResetRequestDto,
  VerifyResendRequestDto,
  RefreshRequestDto,
} from './types';

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

const readTokenValue = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const tokenValue = (value as { token?: unknown }).token;
    if (typeof tokenValue === 'string') return tokenValue;
  }
  return null;
};

const extractTokens = (response: unknown): AuthTokens => {
  if (typeof response === 'string') {
    return { accessToken: response, refreshToken: null };
  }
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid token response.');
  }
  const data = response as Record<string, unknown>;
  const accessToken =
    readTokenValue(data.accessToken ?? data.AccessToken) ??
    readTokenValue(data.token ?? data.Token);
  if (!accessToken) {
    throw new Error('Invalid token response.');
  }
  const refreshToken =
    readTokenValue(data.refreshToken ?? data.RefreshToken) ??
    readTokenValue(data.newRefreshToken ?? data.NewRefreshToken);

  return { accessToken, refreshToken };
};

export const login = async (payload: LoginRequestDto) => {
  const response = await api.post<unknown>('/api/auth/login', payload, false);
  return extractTokens(response);
};

export const register = async (payload: RegisterRequestDto) => {
  await api.post('/api/auth/register', payload, false);
};

export const recovery = async (payload: RecoveryRequestDto) => {
  await api.post('/api/auth/recovery', payload, false);
};

export const resetPassword = async (payload: ResetRequestDto) => {
  await api.post('/api/auth/reset', payload, false);
};

export const verify = async (token: string) => {
  await api.get(`/api/auth/verify`, { token }, false);
};

export const resendVerification = async (payload: VerifyResendRequestDto) => {
  await api.post('/api/auth/verify/resend', payload, false);
};

export const refreshToken = async (payload: RefreshRequestDto) => {
  const response = await api.post<unknown>('/api/auth/refresh', payload, false);
  return extractTokens(response);
};
