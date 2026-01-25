import { api } from './client';
import {
  CreateRequestRequestDto,
  OfferListItemDto,
  PagedResponseDto,
  RequestDetailsDto,
  RequestListItemDto,
  UpdateRequestRequestDto,
} from './types';

export const listRequests = (communityId: string) => api.get<RequestListItemDto[]>('/api/requests', { communityId });

export const getRequest = (id: string) => api.get<RequestDetailsDto>(`/api/requests/${id}`);

export const getRequestOffers = (id: string, query?: { page?: number; pageSize?: number }) =>
  api.get<PagedResponseDto<OfferListItemDto>>(`/api/requests/${id}/offers`, query);

export const listMyRequests = (query?: { communityId?: string; status?: string; page?: number; pageSize?: number }) =>
  api.get<PagedResponseDto<RequestListItemDto>>('/api/requests/me', query);

export const createRequest = (payload: CreateRequestRequestDto) =>
  api.post<RequestDetailsDto>('/api/requests', payload);

export const updateRequest = (id: string, payload: UpdateRequestRequestDto) =>
  api.put<RequestDetailsDto>(`/api/requests/${id}`, payload);

export const deleteRequest = (id: string) => api.del<void>(`/api/requests/${id}`);
