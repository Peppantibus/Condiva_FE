import { api } from './client';
import { CreateEventRequestDto, EventDetailsDto, EventListItemDto, UpdateEventRequestDto } from './types';

export const listEvents = () => api.get<EventListItemDto[]>('/api/events');

export const getEvent = (id: string) => api.get<EventDetailsDto>(`/api/events/${id}`);

export const createEvent = (payload: CreateEventRequestDto) => api.post<EventDetailsDto>('/api/events', payload);

export const updateEvent = (id: string, payload: UpdateEventRequestDto) =>
  api.put<EventDetailsDto>(`/api/events/${id}`, payload);

export const deleteEvent = (id: string) => api.del<void>(`/api/events/${id}`);
