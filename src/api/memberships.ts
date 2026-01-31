import { apiClient } from './client';
import { CreateMembershipRequestDto, UpdateMembershipRequestDto, UpdateMembershipRoleRequestDto } from './types';

export const listMemberships = () => apiClient.membershipsAll();

export const listMyMemberships = () => apiClient.meAll();

export const listMyCommunities = () => apiClient.communitiesAll2();

export const getMembership = (id: string) => apiClient.membershipsGET(id);

export const createMembership = (payload: CreateMembershipRequestDto) =>
  apiClient.membershipsPOST(payload as any);

export const updateMembership = (id: string, payload: UpdateMembershipRequestDto) =>
  apiClient.membershipsPUT(id, payload as any);

export const updateMembershipRole = (id: string, payload: UpdateMembershipRoleRequestDto) =>
  apiClient.role(id, payload as any);

export const deleteMembership = (id: string) => apiClient.membershipsDELETE(id);

export const leaveCommunity = (communityId: string) => apiClient.leave(communityId);
