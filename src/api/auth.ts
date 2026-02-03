import { apiClient } from './client';
import type { AuthTokens } from './client';
import {
  LoginRequestDto,
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

const extractTokens = (response: unknown): AuthTokens => {
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
    readTokenValue(data.newRefreshToken ?? data.NewRefreshToken) ??
    readTokenValue(data.refreshToken ?? data.RefreshToken);

  return { accessToken, refreshToken };
};

export const login = async (payload: LoginRequestDto) => {
  const response = await apiClient.login(payload as any);
  return extractTokens(response);
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

export const refreshToken = async (payload: RefreshRequestDto) => {
  const response = await apiClient.refresh(payload as any);
  return extractTokens(response);
};
