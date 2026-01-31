import { apiClient } from './client';
import { CreateItemRequestDto, UpdateItemRequestDto } from './types';

export const listItems = (communityId: string) => apiClient.itemsAll(communityId);

export const getItem = (id: string) => apiClient.itemsGET(id);

export const createItem = (payload: CreateItemRequestDto) => apiClient.itemsPOST(payload as any);

export const updateItem = (id: string, payload: UpdateItemRequestDto) =>
  apiClient.itemsPUT(id, payload as any);

export const deleteItem = (id: string) => apiClient.itemsDELETE(id);
