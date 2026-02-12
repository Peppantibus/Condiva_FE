import React, { createContext, useContext, useMemo, useState } from 'react';
import { listMyCommunities } from '../api/memberships';
import { useAuth } from './auth';

const COMMUNITY_KEY = 'condiva.session.communityId';
const COMMUNITY_NAME_KEY = 'condiva.session.communityName';

const decodeJwtPayload = (token: string) => {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = parts[1];
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  try {
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getUserIdFromToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const keys = [
    'sub',
    'userId',
    'nameid',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ];
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return null;
};

const getUserNameFromToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const keys = ['unique_name', 'preferred_username', 'username', 'name'];
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return null;
};

type SessionContextValue = {
  activeCommunityId: string | null;
  activeCommunityName: string | null;
  setActiveCommunity: (id: string | null, name?: string | null) => void;
  userId: string | null;
  userName: string | null;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [activeCommunityId, setActiveCommunityIdState] = useState<string | null>(
    () => localStorage.getItem(COMMUNITY_KEY)
  );
  const [activeCommunityName, setActiveCommunityNameState] = useState<string | null>(
    () => localStorage.getItem(COMMUNITY_NAME_KEY)
  );
  const [userId, setUserIdState] = useState<string | null>(() => user?.id ?? (token ? getUserIdFromToken(token) : null));
  const [userName, setUserNameState] = useState<string | null>(
    () => user?.username ?? (token ? getUserNameFromToken(token) : null)
  );

  const setActiveCommunity = React.useCallback((id: string | null, name?: string | null) => {
    setActiveCommunityIdState(id);
    if (id) {
      localStorage.setItem(COMMUNITY_KEY, id);
    } else {
      localStorage.removeItem(COMMUNITY_KEY);
    }

    const resolvedName = id ? (name ?? null) : null;
    setActiveCommunityNameState(resolvedName);
    if (resolvedName) {
      localStorage.setItem(COMMUNITY_NAME_KEY, resolvedName);
    } else {
      localStorage.removeItem(COMMUNITY_NAME_KEY);
    }
  }, []);

  React.useEffect(() => {
    setUserIdState(user?.id ?? (token ? getUserIdFromToken(token) : null));
    setUserNameState(user?.username ?? (token ? getUserNameFromToken(token) : null));
  }, [token, user]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const resolveDefaultCommunity = async () => {
      try {
        const communities = await listMyCommunities();
        if (cancelled) return;
        if (!communities.length) {
          if (activeCommunityId) {
            setActiveCommunity(null, null);
          }
          return;
        }

        const byId = new Map(communities.map((community) => [community.id, community]));
        if (activeCommunityId) {
          const active = byId.get(activeCommunityId);
          if (active?.id) {
            if (activeCommunityName !== active.name) {
              setActiveCommunity(active.id, active.name ?? null);
            }
            return;
          }
        }

        if (communities.length === 1) {
          const onlyCommunity = communities[0];
          if (onlyCommunity.id) {
            setActiveCommunity(onlyCommunity.id, onlyCommunity.name ?? null);
          } else {
            setActiveCommunity(null, null);
          }
        } else if (activeCommunityId && !byId.has(activeCommunityId)) {
          setActiveCommunity(null, null);
        }
      } catch {
        // ignore community default lookup errors
      }
    };

    resolveDefaultCommunity();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, activeCommunityId, activeCommunityName, setActiveCommunity]);

  const value = useMemo(
    () => ({
      activeCommunityId,
      activeCommunityName,
      setActiveCommunity,
      userId,
      userName,
    }),
    [activeCommunityId, activeCommunityName, setActiveCommunity, userId, userName]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider.');
  }
  return ctx;
};
