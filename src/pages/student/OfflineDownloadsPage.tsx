import { memo, useState, useEffect, useCallback } from 'react';
import { Download, FileText, Video, BookOpen, Trash2, Loader } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard } from '@/components/analytics';
import { offlineStorage } from '@/services/pwa';

interface OfflineItem { key: string; type: string; size: number; downloadedAt: number; }

function OfflineDownloadsPageComponent() {
  const [items, setItems] = useState<OfflineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const loadItems = useCallback(() => {
    const keys = offlineStorage.getOfflineKeys();
    const offlineItems: OfflineItem[] = keys.map((key) => {
      const data = localStorage.getItem(`lms_offline_data_${key}`);
      return { key, type: key.split('_')[0] ?? 'unknown', size: data ? data.length : 0, downloadedAt: Date.now() };
    });
    setItems(offlineItems);
    setLoading(false);
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);
  const handleRemove = useCallback((key: string) => { offlineStorage.removeData(key); loadItems(); }, [loadItems]);
  const totalSize = items.reduce((sum, item) => sum + item.size, 0);
  const getIcon = (type: string) => { if (type === 'video') return Video; if (type === 'pdf') return FileText; return BookOpen; };
  const formatSize = (bytes: number): string => { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; };
  return (
    <PageContainer>
      <SectionHeader title="Offline Downloads" description="Manage your downloaded content for offline learning" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AnalyticsCard title="Downloaded Items" value={items.length} icon={Download} color="primary" />
        <AnalyticsCard title="Storage Used" value={formatSize(totalSize)} icon={FileText} color="success" />
        <AnalyticsCard title="Available Offline" value={items.filter((i) => i.type === 'pdf' || i.type === 'video').length} icon={BookOpen} color="accent" />
      </div>
      {loading ? (<div className="flex h-40 items-center justify-center text-neutral-400"><Loader className="h-6 w-6 animate-spin" /></div>) : items.length === 0 ? (
        <div className="mt-6 flex h-40 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400">No offline downloads yet. Download content to study without internet.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">{(() => { const Icon = getIcon(item.type); return <Icon className="h-5 w-5 text-primary-600" />; })()}</div>
                <div><p className="text-sm font-medium text-neutral-900">{item.key}</p><p className="text-xs text-neutral-400">{formatSize(item.size)} | {item.type}</p></div>
              </div>
              <button onClick={() => handleRemove(item.key)} className="rounded-lg p-2 text-neutral-400 hover:bg-error-50 hover:text-error-600" aria-label="Remove download"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
export const OfflineDownloadsPage = memo(OfflineDownloadsPageComponent);
