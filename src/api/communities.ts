import { api } from './client';
import {
  CommunityDetailsDto,
  CommunityListItemDto,
  CreateCommunityRequestDto,
  UpdateCommunityRequestDto,
  InviteCodeResponseDto,
  InviteLinkResponseDto,
  JoinCommunityRequestDto,
  MembershipDetailsDto,
  PagedResponseDto,
  RequestListItemDto,
  ItemListItemDto,
} from './types';

export const listCommunities = () => api.get<CommunityListItemDto[]>('/api/communities');

export const getCommunity = (id: string) => api.get<CommunityDetailsDto>(`/api/communities/${id}`);

export const createCommunity = (payload: CreateCommunityRequestDto) =>
  api.post<CommunityDetailsDto>('/api/communities', payload);

export const updateCommunity = (id: string, payload: UpdateCommunityRequestDto) =>
  api.put<CommunityDetailsDto>(`/api/communities/${id}`, payload);

export const deleteCommunity = (id: string) => api.del<void>(`/api/communities/${id}`);

export const getInviteCode = (id: string) => api.get<InviteCodeResponseDto>(`/api/communities/${id}/invite-code`);

export const getInviteLink = (id: string) => api.get<InviteLinkResponseDto>(`/api/communities/${id}/invite-link`);

export const rotateInviteCode = (id: string) =>
  api.post<InviteCodeResponseDto>(`/api/communities/${id}/invite-code/rotate`);

export const joinCommunity = (payload: JoinCommunityRequestDto) =>
  api.post<MembershipDetailsDto>('/api/communities/join', payload);

export const getCommunityRequestsFeed = (
  id: string,
  query?: { status?: string; page?: number; pageSize?: number }
) => api.get<PagedResponseDto<RequestListItemDto>>(`/api/communities/${id}/requests/feed`, query);

export const getCommunityAvailableItems = (
  id: string,
  query?: { category?: string; page?: number; pageSize?: number }
) => api.get<PagedResponseDto<ItemListItemDto>>(`/api/communities/${id}/items/available`, query);
