import { apiClient } from './client';
import { CreateCommunityRequestDto, JoinCommunityRequestDto, UpdateCommunityRequestDto } from './types';

export const listCommunities = () => apiClient.communitiesAll();

export const getCommunity = (id: string) => apiClient.communitiesGET(id);

export const createCommunity = (payload: CreateCommunityRequestDto) =>
  apiClient.communitiesPOST(payload as any);

export const updateCommunity = (id: string, payload: UpdateCommunityRequestDto) =>
  apiClient.communitiesPUT(id, payload as any);

export const deleteCommunity = (id: string) => apiClient.communitiesDELETE(id);

export const getInviteCode = (id: string) => apiClient.inviteCode(id);

export const getInviteLink = (id: string) => apiClient.inviteLink(id);

export const rotateInviteCode = (id: string) =>
  apiClient.rotate(id);

export const joinCommunity = (payload: JoinCommunityRequestDto) =>
  apiClient.join(payload as any);

export const getCommunityRequestsFeed = (
  id: string,
  query?: { status?: string; page?: number; pageSize?: number; excludingMine?: boolean }
) => apiClient.feed(id, query?.status, query?.excludingMine, query?.page, query?.pageSize);

export const getCommunityAvailableItems = (
  id: string,
  query?: { category?: string; page?: number; pageSize?: number }
) => apiClient.available(id, query?.category, query?.page, query?.pageSize);
