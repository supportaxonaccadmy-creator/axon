import { useCallback, useState, type ReactNode } from 'react';
import { SessionContext } from '@/contexts/SessionContext';
import { uuid } from '@/utils/ids';
import type { SessionContextValue } from '@/types/providers';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState(() => uuid());
  const [startTime] = useState(() => Date.now());
  const [lastActivity, setLastActivity] = useState(() => Date.now());

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  const resetSession = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  const value: SessionContextValue = {
    sessionId,
    startTime,
    isActive: Date.now() - lastActivity < 30 * 60 * 1000,
    lastActivity,
    updateActivity,
    resetSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
