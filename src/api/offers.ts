import { api } from './client';
import {
  AcceptOfferRequestDto,
  CreateOfferRequestDto,
  LoanDetailsDto,
  OfferDetailsDto,
  OfferListItemDto,
  OfferStatusResponseDto,
  PagedResponseDto,
  UpdateOfferRequestDto,
} from './types';

export const listOffers = () => api.get<OfferListItemDto[]>('/api/offers');

export const getOffer = (id: string) => api.get<OfferDetailsDto>(`/api/offers/${id}`);

export const listMyOffers = (query?: { communityId?: string; status?: string; page?: number; pageSize?: number }) =>
  api.get<PagedResponseDto<OfferListItemDto>>('/api/offers/me', query);

export const createOffer = (payload: CreateOfferRequestDto) => api.post<OfferDetailsDto>('/api/offers', payload);

export const updateOffer = (id: string, payload: UpdateOfferRequestDto) =>
  api.put<OfferDetailsDto>(`/api/offers/${id}`, payload);

export const deleteOffer = (id: string) => api.del<void>(`/api/offers/${id}`);

export const acceptOffer = (id: string, payload: AcceptOfferRequestDto) =>
  api.post<LoanDetailsDto>(`/api/offers/${id}/accept`, payload);

export const rejectOffer = (id: string) => api.post<OfferStatusResponseDto>(`/api/offers/${id}/reject`);

export const withdrawOffer = (id: string) => api.post<OfferStatusResponseDto>(`/api/offers/${id}/withdraw`);
