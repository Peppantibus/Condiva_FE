import { api } from './client';
import {
  CommunityListItemDto,
  CreateMembershipRequestDto,
  MembershipDetailsDto,
  MembershipListItemDto,
  UpdateMembershipRequestDto,
  UpdateMembershipRoleRequestDto,
} from './types';

export const listMemberships = () => api.get<MembershipListItemDto[]>('/api/memberships');

export const listMyCommunities = () => api.get<CommunityListItemDto[]>('/api/memberships/me/communities');

export const getMembership = (id: string) => api.get<MembershipDetailsDto>(`/api/memberships/${id}`);

export const createMembership = (payload: CreateMembershipRequestDto) =>
  api.post<MembershipDetailsDto>('/api/memberships', payload);

export const updateMembership = (id: string, payload: UpdateMembershipRequestDto) =>
  api.put<MembershipDetailsDto>(`/api/memberships/${id}`, payload);

export const updateMembershipRole = (id: string, payload: UpdateMembershipRoleRequestDto) =>
  api.post<MembershipDetailsDto>(`/api/memberships/${id}/role`, payload);

export const deleteMembership = (id: string) => api.del<void>(`/api/memberships/${id}`);

export const leaveCommunity = (communityId: string) => api.post<void>(`/api/memberships/leave/${communityId}`);
