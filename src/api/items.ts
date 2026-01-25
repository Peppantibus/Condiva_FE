import { api } from './client';
import { CreateItemRequestDto, ItemDetailsDto, ItemListItemDto, UpdateItemRequestDto } from './types';

export const listItems = (communityId: string) => api.get<ItemListItemDto[]>('/api/items', { communityId });

export const getItem = (id: string) => api.get<ItemDetailsDto>(`/api/items/${id}`);

export const createItem = (payload: CreateItemRequestDto) => api.post<ItemDetailsDto>('/api/items', payload);

export const updateItem = (id: string, payload: UpdateItemRequestDto) =>
  api.put<ItemDetailsDto>(`/api/items/${id}`, payload);

export const deleteItem = (id: string) => api.del<void>(`/api/items/${id}`);
