import { useState, useEffect, useCallback } from 'react';
import { sessionService, auditSecurity } from '@/services/security';

export function useSessionSecurity() {
  const [expired, setExpired] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  useEffect(() => {
    sessionService.init();
    const unsub = sessionService.subscribe((isExpired) => { setExpired(isExpired); if (isExpired) { void auditSecurity.logEvent('session_expired', 'warning'); } });
    const timer = setInterval(() => { setTimeUntilExpiry(sessionService.getTimeUntilExpiry()); if (sessionService.isExpired() && !expired) { setExpired(true); } }, 5000);
    return () => { unsub(); clearInterval(timer); };
  }, [expired]);
  const refreshSession = useCallback(() => { sessionService.refresh(); setExpired(false); setTimeUntilExpiry(sessionService.getTimeUntilExpiry()); }, []);
  const clearSession = useCallback(() => { sessionService.clear(); setExpired(true); }, []);
  return { expired, timeUntilExpiry, refreshSession, clearSession };
}
