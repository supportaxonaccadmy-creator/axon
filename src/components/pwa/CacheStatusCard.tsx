import { memo, useState, useEffect, useCallback } from 'react';
import { Database, Trash2 } from 'lucide-react';
import { cacheService } from '@/services/pwa';

function CacheStatusCardComponent() {
  const [stats, setStats] = useState(cacheService.getStats());
  useEffect(() => {
    const unsub = cacheService.subscribe(() => setStats(cacheService.getStats()));
    return unsub;
  }, []);
  const handleClear = useCallback(() => { cacheService.clear(); setStats(cacheService.getStats()); }, []);
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Database className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Cache Status</h3></div>
        <button onClick={handleClear} className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100" aria-label="Clear cache"><Trash2 className="h-3 w-3" /> Clear</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-neutral-50 p-3 text-center"><p className="text-2xl font-bold text-neutral-900">{stats.totalEntries}</p><p className="text-xs text-neutral-500">Cache Entries</p></div>
        <div className="rounded-lg bg-neutral-50 p-3 text-center"><p className="text-2xl font-bold text-neutral-900">{formatSize(stats.storageSize)}</p><p className="text-xs text-neutral-500">Storage Size</p></div>
      </div>
    </div>
  );
}
export const CacheStatusCard = memo(CacheStatusCardComponent);
