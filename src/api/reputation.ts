import { apiClient } from './client';

export const getMyReputation = (communityId: string) =>
  apiClient.me2(communityId);

export const getUserReputation = (communityId: string, userId: string) =>
  apiClient.users(communityId, userId);
