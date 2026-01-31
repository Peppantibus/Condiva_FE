import { apiClient } from './client';
import { AcceptOfferRequestDto, CreateOfferRequestDto, UpdateOfferRequestDto } from './types';

export const listOffers = () => apiClient.offersAll();

export const getOffer = (id: string) => apiClient.offersGET(id);

export const listMyOffers = (query?: { communityId?: string; status?: string; page?: number; pageSize?: number }) =>
  apiClient.me(query?.communityId, query?.status, query?.page, query?.pageSize);

export const createOffer = (payload: CreateOfferRequestDto) => apiClient.offersPOST(payload as any);

export const updateOffer = (id: string, payload: UpdateOfferRequestDto) =>
  apiClient.offersPUT(id, payload as any);

export const deleteOffer = (id: string) => apiClient.offersDELETE(id);

export const acceptOffer = (id: string, payload: AcceptOfferRequestDto) =>
  apiClient.accept(id, payload as any);

export const rejectOffer = (id: string) => apiClient.reject(id);

export const withdrawOffer = (id: string) => apiClient.withdraw(id);
