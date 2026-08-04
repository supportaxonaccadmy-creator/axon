import { memo, useState, useCallback } from 'react';
import { Clock, LogIn } from 'lucide-react';
import { useSessionSecurity } from '@/hooks/useSessionSecurity';

function SessionTimeoutDialogComponent() {
  const { expired, refreshSession } = useSessionSecurity();
  const [dismissed, setDismissed] = useState(false);
  const handleRefresh = useCallback(() => { refreshSession(); setDismissed(false); }, [refreshSession]);
  const handleDismiss = useCallback(() => setDismissed(true), []);
  if (!expired || dismissed) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="session-timeout-title">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50"><Clock className="h-5 w-5 text-warning-600" /></div><h2 id="session-timeout-title" className="text-lg font-semibold text-neutral-900">Session Expired</h2></div>
        <p className="mb-6 text-sm text-neutral-600">Your session has expired due to inactivity. Would you like to continue?</p>
        <div className="flex justify-end gap-3"><button onClick={handleDismiss} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Dismiss</button><button onClick={handleRefresh} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"><LogIn className="h-4 w-4" /> Continue Session</button></div>
      </div>
    </div>
  );
}
export const SessionTimeoutDialog = memo(SessionTimeoutDialogComponent);
