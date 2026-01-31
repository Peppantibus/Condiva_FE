import { apiClient } from './client';
import { CreateEventRequestDto, UpdateEventRequestDto } from './types';

export const listEvents = () => apiClient.eventsAll();

export const getEvent = (id: string) => apiClient.eventsGET(id);

export const createEvent = (payload: CreateEventRequestDto) =>
  apiClient.eventsPOST(payload as any);

export const updateEvent = (id: string, payload: UpdateEventRequestDto) =>
  apiClient.eventsPUT(id, payload as any);

export const deleteEvent = (id: string) => apiClient.eventsDELETE(id);
