import { apiClient } from './client';
import { NotificationDetailsDto, NotificationListItemDtoPagedResult } from './types';

type NotificationListQuery = {
  communityId?: string;
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
};

export const listNotifications = (query?: NotificationListQuery): Promise<NotificationListItemDtoPagedResult> =>
  apiClient.notifications(query?.communityId, query?.unreadOnly, query?.page, query?.pageSize);

export const getNotification = (id: string): Promise<NotificationDetailsDto> => apiClient.notifications2(id);

export const markNotificationRead = (id: string): Promise<NotificationDetailsDto> => apiClient.read(id);

export const markNotificationsRead = (ids: string[]): Promise<NotificationDetailsDto[]> =>
  apiClient.readAll({ ids } as any);
