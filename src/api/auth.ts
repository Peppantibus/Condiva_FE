import { apiClient } from './client';
import type { AuthSession, AuthUser } from './client';
import {
  LoginRequestDto,
  GoogleLoginRequestDto,
  RegisterRequestDto,
  RecoveryRequestDto,
  ResetRequestDto,
  VerifyResendRequestDto,
  RefreshRequestDto,
} from './types';

const readTokenValue = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const tokenValue = (value as { token?: unknown }).token;
    if (typeof tokenValue === 'string') return tokenValue;
  }
  return null;
};

const extractUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  const id = typeof (data.id ?? data.Id) === 'string' ? String(data.id ?? data.Id) : null;
  const username = typeof (data.username ?? data.Username) === 'string'
    ? String(data.username ?? data.Username)
    : null;
  const name = typeof (data.name ?? data.Name) === 'string' ? String(data.name ?? data.Name) : null;
  const lastName = typeof (data.lastName ?? data.LastName) === 'string'
    ? String(data.lastName ?? data.LastName)
    : null;

  if (!id && !username && !name && !lastName) return null;
  return { id, username, name, lastName };
};

const extractSession = (response: unknown): AuthSession => {
  if (!response || typeof response !== 'object') {
    return { accessToken: null, user: null };
  }

  const data = response as Record<string, unknown>;
  const accessToken =
    readTokenValue(data.accessToken ?? data.AccessToken) ??
    readTokenValue(data.token ?? data.Token);
  const user = extractUser(data.user ?? data.User);

  return { accessToken, user };
};

export const login = async (payload: LoginRequestDto) => {
  const response = await apiClient.login(payload as any);
  return extractSession(response);
};

export const loginWithGoogle = async (payload: GoogleLoginRequestDto) => {
  const response = await apiClient.google(payload as any);
  return extractSession(response);
};

export const register = async (payload: RegisterRequestDto) => {
  await apiClient.register(payload as any);
};

export const recovery = async (payload: RecoveryRequestDto) => {
  await apiClient.recovery(payload as any);
};

export const resetPassword = async (payload: ResetRequestDto) => {
  await apiClient.reset(payload as any);
};

export const verify = async (token: string) => {
  await apiClient.verify(token);
};

export const resendVerification = async (payload: VerifyResendRequestDto) => {
  await apiClient.resend(payload as any);
};

export const refreshSession = async (payload?: RefreshRequestDto) => {
  const response = await apiClient.refresh(payload as any);
  return extractSession(response);
};

export const refreshToken = refreshSession;

export const logout = async () => {
  await apiClient.logout();
};
