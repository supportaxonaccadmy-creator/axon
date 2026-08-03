import { memo, useCallback } from 'react';
import { RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';

function SyncProgressCardComponent() {
  const { queueCount, isSyncing, syncNow, clearQueue } = useOffline();
  const handleSync = useCallback(() => { void syncNow(); }, [syncNow]);
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">Sync Progress</h3>
        {queueCount > 0 && (<button onClick={clearQueue} className="text-xs text-neutral-400 hover:text-error-600" aria-label="Clear queue">Clear all</button>)}
      </div>
      {queueCount === 0 ? (
        <div className="flex items-center gap-2 text-sm text-success-600"><CheckCircle className="h-4 w-4" /> All data synchronized</div>
      ) : (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-neutral-600">
            {isSyncing ? <Loader className="h-4 w-4 animate-spin text-primary-500" /> : <XCircle className="h-4 w-4 text-warning-500" />}
            {queueCount} item(s) {isSyncing ? 'syncing...' : 'pending'}
          </div>
          <button onClick={handleSync} disabled={isSyncing} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}
    </div>
  );
}
export const SyncProgressCard = memo(SyncProgressCardComponent);
