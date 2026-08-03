import { memo, useState, useEffect, useCallback } from 'react';
import { BookOpen, FileText, Video, Bell, MessageSquare, Loader } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard, BatchInsightCard } from '@/components/analytics';
import { offlineStorage } from '@/services/pwa';
import { useBatchAnalytics } from '@/hooks/useBatchAnalytics';

interface OfflineContent { category: string; count: number; icon: typeof BookOpen; }

function OfflineLibraryPageComponent() {
  const [content, setContent] = useState<OfflineContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { allSummaries } = useBatchAnalytics();
  const loadContent = useCallback(() => {
    const keys = offlineStorage.getOfflineKeys();
    const categories = new Map<string, number>();
    for (const key of keys) { const cat = key.split('_')[0] ?? 'other'; categories.set(cat, (categories.get(cat) ?? 0) + 1); }
    const items: OfflineContent[] = Array.from(categories.entries()).map(([cat, count]) => ({
      category: cat, count,
      icon: cat === 'pdf' ? FileText : cat === 'video' ? Video : cat === 'notification' ? Bell : cat === 'announcement' ? MessageSquare : BookOpen,
    }));
    setContent(items);
    setLoading(false);
  }, []);
  useEffect(() => { loadContent(); }, [loadContent]);
  return (
    <PageContainer>
      <SectionHeader title="Offline Library" description="Access your learning content without internet" />
      {loading ? (<div className="flex h-40 items-center justify-center text-neutral-400"><Loader className="h-6 w-6 animate-spin" /></div>) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.map((item) => (<AnalyticsCard key={item.category} title={item.category.charAt(0).toUpperCase() + item.category.slice(1)} value={item.count} icon={item.icon} color="primary" />))}
            {content.length === 0 && (<><AnalyticsCard title="PDFs" value={0} icon={FileText} color="primary" /><AnalyticsCard title="Videos" value={0} icon={Video} color="accent" /><AnalyticsCard title="Announcements" value={0} icon={MessageSquare} color="success" /><AnalyticsCard title="Notifications" value={0} icon={Bell} color="warning" /></>)}
          </div>
          {allSummaries.length > 0 && (<div className="mt-6"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Cached Batches</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{allSummaries.map((s) => <BatchInsightCard key={s.batchId} summary={s} />)}</div></div>)}
        </>
      )}
    </PageContainer>
  );
}
export const OfflineLibraryPage = memo(OfflineLibraryPageComponent);
