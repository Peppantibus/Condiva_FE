import { apiClient } from './client';
import { CreateRequestRequestDto, UpdateRequestRequestDto } from './types';

export const listRequests = (communityId: string) => apiClient.requestsAll(communityId);

export const getRequest = (id: string) => apiClient.requestsGET(id);

export const getRequestOffers = (id: string, query?: { page?: number; pageSize?: number }) =>
  apiClient.offersGET2(id, query?.page, query?.pageSize);

export const listMyRequests = (query?: { communityId?: string; status?: string; page?: number; pageSize?: number }) =>
  apiClient.me3(query?.communityId, query?.status, query?.page, query?.pageSize);

export const createRequest = (payload: CreateRequestRequestDto) =>
  apiClient.requestsPOST(payload as any);

export const updateRequest = (id: string, payload: UpdateRequestRequestDto) =>
  apiClient.requestsPUT(id, payload as any);

export const deleteRequest = (id: string) => apiClient.requestsDELETE(id);
