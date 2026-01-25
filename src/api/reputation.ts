import { api } from './client';
import { ReputationDetailsDto } from './types';

export const getMyReputation = (communityId: string) =>
  api.get<ReputationDetailsDto>(`/api/reputation/${communityId}/me`);

export const getUserReputation = (communityId: string, userId: string) =>
  api.get<ReputationDetailsDto>(`/api/reputation/${communityId}/users/${userId}`);
