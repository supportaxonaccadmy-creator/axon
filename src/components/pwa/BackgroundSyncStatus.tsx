import { memo, useState, useEffect } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { backgroundSync } from '@/services/pwa';

function BackgroundSyncStatusComponent() {
  const [pending, setPending] = useState(backgroundSync.pendingCount);
  useEffect(() => {
    const unsub = backgroundSync.subscribe(() => setPending(backgroundSync.pendingCount));
    return unsub;
  }, []);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm" role="status" aria-live="polite">
      {pending > 0 ? (<><RefreshCw className="h-4 w-4 animate-spin text-warning-500" /><span className="text-sm font-medium text-neutral-600">{pending} item(s) pending sync</span></>) : (<><CheckCircle className="h-4 w-4 text-success-500" /><span className="text-sm font-medium text-neutral-600">All data synced</span></>)}
    </div>
  );
}
export const BackgroundSyncStatus = memo(BackgroundSyncStatusComponent);
