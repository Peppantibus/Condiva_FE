import React from 'react';
import { listNotifications, markNotificationRead, markNotificationsRead } from '../api/notifications';
import { NotificationListItemDto } from '../api/types';
import { getOffer } from '../api/offers';
import { getLoan } from '../api/loans';
import { useSession } from '../state/session';
import { BellIcon } from './ui/Icons';
import { useNavigate } from 'react-router-dom';
import {
  buildNotificationMessage,
  normalizeNotificationType,
  type NotificationEntity,
} from '../utils/notifications';

const POLL_INTERVAL_MS = 20000;
const LIST_PAGE_SIZE = 20;
const TABS = ['unread', 'read', 'all'] as const;
type NotificationsTab = (typeof TABS)[number];

const formatNotificationDate = (value?: string | Date) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const NotificationsBell: React.FC = () => {
  const { activeCommunityId } = useSession();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationListItemDto[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<NotificationsTab>('unread');
  const [entitiesById, setEntitiesById] = React.useState<Record<string, NotificationEntity>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const entitiesByIdRef = React.useRef<Record<string, NotificationEntity>>({});

  const refreshUnreadCount = React.useCallback(async () => {
    try {
      const result = await listNotifications({
        communityId: activeCommunityId ?? undefined,
        unreadOnly: true,
        page: 1,
        pageSize: 1,
      });
      const total = typeof result.total === 'number' ? result.total : result.items?.length ?? 0;
      setUnreadCount(total);
    } catch {
      // keep previous count on error
    }
  }, [activeCommunityId]);

  const loadNotifications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listNotifications({
        communityId: activeCommunityId ?? undefined,
        page: 1,
        pageSize: LIST_PAGE_SIZE,
      });
      const items = result.items ?? [];
      setNotifications(items);
      const entityIds = items
        .map((item) => ({
          entityId: item.entityId,
          entityType: normalizeNotificationType(item.entityType),
        }))
        .filter(
          (item): item is { entityId: string; entityType: 'Offer' | 'Loan' } =>
            !!item.entityId && (item.entityType === 'Offer' || item.entityType === 'Loan')
        );

      if (entityIds.length) {
        const currentEntities = entitiesByIdRef.current;
        const missing = entityIds.filter((entity) => !currentEntities[entity.entityId]);
        if (missing.length) {
          const fetches = missing.map(async (entity) => {
            if (entity.entityType === 'Offer') {
              const offer = await getOffer(entity.entityId);
              return { entityId: entity.entityId, entity: { entityType: 'Offer', data: offer } as NotificationEntity };
            }
            const loan = await getLoan(entity.entityId);
            return { entityId: entity.entityId, entity: { entityType: 'Loan', data: loan } as NotificationEntity };
          });

          const resolved = await Promise.allSettled(fetches);
          setEntitiesById((prev) => {
            const next = { ...prev };
            for (const resultItem of resolved) {
              if (resultItem.status === 'fulfilled') {
                next[resultItem.value.entityId] = resultItem.value.entity;
              }
            }
            return next;
          });
        }
      }
    } catch {
      setError('Impossibile caricare le notifiche.');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  React.useEffect(() => {
    refreshUnreadCount();
    const timer = window.setInterval(() => {
      refreshUnreadCount();
      if (isOpen) {
        loadNotifications();
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isOpen, loadNotifications, refreshUnreadCount]);

  React.useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  React.useEffect(() => {
    entitiesByIdRef.current = entitiesById;
  }, [entitiesById]);

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
    } finally {
      refreshUnreadCount();
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, readAt: new Date().toISOString() as any } : item
        )
      );
    }
  };

  const handleMarkAllRead = async () => {
    const ids = notifications.filter((item) => !item.readAt).map((item) => item.id).filter(Boolean) as string[];
    if (!ids.length) return;
    try {
      await markNotificationsRead(ids);
    } finally {
      refreshUnreadCount();
      setNotifications((prev) =>
        prev.map((item) => (item.readAt ? item : { ...item, readAt: new Date().toISOString() as any }))
      );
    }
  };

  const handleNavigateFromNotification = async (notification: NotificationListItemDto) => {
    const entityType = normalizeNotificationType(notification.entityType);
    const entityId = notification.entityId;
    if (!entityId) return;

    try {
      if (entityType === 'Offer') {
        const offer = await getOffer(entityId);
        if (offer.requestId) {
          navigate(`/requests/${offer.requestId}`);
        } else {
          navigate('/me');
        }
        return;
      }

      if (entityType === 'Loan') {
        const loan = await getLoan(entityId);
        if (loan.requestId) {
          navigate(`/requests/${loan.requestId}`);
        } else {
          navigate('/loans');
        }
        return;
      }
    } catch {
      // fall through to generic routes
    }

    if (entityType === 'Loan') {
      navigate('/loans');
      return;
    }

    if (entityType === 'Offer') {
      navigate('/me');
      return;
    }
  };

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter((item) => !item.readAt);
    return notifications.filter((item) => item.readAt);
  }, [activeTab, notifications]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus:ring-slate-400 !p-2 relative"
        aria-label="Apri notifiche"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-700">Notifiche</div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
              disabled={!notifications.some((item) => !item.readAt)}
            >
              Segna tutte come lette
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                {tab === 'all' ? 'Tutte' : tab === 'unread' ? 'Non lette' : 'Lette'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-sm text-slate-400 py-6 text-center">Caricamento...</div>
          ) : error ? (
            <div className="text-sm text-red-500 py-6 text-center">{error}</div>
          ) : filteredNotifications.length ? (
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {filteredNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={async () => {
                    if (!notification.id) return;
                    await handleNotificationClick(notification.id);
                    await handleNavigateFromNotification(notification);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${notification.readAt
                    ? 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    : 'border-primary-100 bg-primary-50/40 hover:border-primary-200 hover:bg-primary-50'
                    }`}
                >
                  <div className="text-sm text-slate-800 font-medium">
                    {buildNotificationMessage(
                      normalizeNotificationType(notification.type),
                      notification.entityId ? entitiesById[notification.entityId] : undefined
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{formatNotificationDate(notification.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 py-6 text-center">
              {activeTab === 'read' ? 'Nessuna notifica letta.' : activeTab === 'unread' ? 'Nessuna notifica non letta.' : 'Nessuna notifica.'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
