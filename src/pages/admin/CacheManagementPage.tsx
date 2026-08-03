import { memo, useState, useCallback, useEffect } from 'react';
import { Database, Trash2, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { CacheStatusCard, BackgroundSyncStatus, SyncProgressCard } from '@/components/pwa';
import { cacheService, serviceWorker } from '@/services/pwa';

function CacheManagementPageComponent() {
  const [cacheSize, setCacheSize] = useState(0);
  const [clearing, setClearing] = useState(false);
  const loadCacheSize = useCallback(async () => { const size = await serviceWorker.getCacheSize(); setCacheSize(size); }, []);
  useEffect(() => { loadCacheSize(); }, [loadCacheSize]);
  const handleClearAll = useCallback(async () => {
    setClearing(true);
    cacheService.clear();
    await serviceWorker.clearCache();
    await loadCacheSize();
    setClearing(false);
  }, [loadCacheSize]);
  return (
    <PageContainer>
      <SectionHeader title="Cache Management" description="Manage application cache and offline storage" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><CacheStatusCard /><SyncProgressCard /></div>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900"><Database className="h-4 w-4 text-primary-500" /> Service Worker Cache</h3>
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-2xl font-bold text-neutral-900">{cacheSize}</p><p className="text-xs text-neutral-500">Cached responses</p></div>
          <button onClick={handleClearAll} disabled={clearing} className="flex items-center gap-2 rounded-lg border border-error-200 px-4 py-2 text-sm font-medium text-error-600 transition-colors hover:bg-error-50 disabled:opacity-50">
            {clearing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {clearing ? 'Clearing...' : 'Clear All Cache'}
          </button>
        </div>
      </div>
      <div className="mt-6"><BackgroundSyncStatus /></div>
    </PageContainer>
  );
}
export const CacheManagementPage = memo(CacheManagementPageComponent);
