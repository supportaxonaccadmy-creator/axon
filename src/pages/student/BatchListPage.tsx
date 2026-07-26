import { useState, useMemo } from 'react';
import { Layers, BookOpen, Lock, Sparkles } from 'lucide-react';
import { useStudentBatches } from '@/hooks/useStudentBatches';
import { StudentBatchListCard } from '@/components/student/lms/StudentBatchListCard';
import { StudentDashboardSection } from '@/components/student/dashboard/StudentDashboardSection';
import { StudentDashboardGrid } from '@/components/student/dashboard/StudentDashboardGrid';
import { EmptyDashboard } from '@/components/student/dashboard/EmptyDashboard';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { Input } from '@/components/ui/Input';
import { StudentStatCard } from '@/components/student/dashboard/StudentStatCard';
import { cn } from '@/utils/cn';

type Tab = 'all' | 'purchased' | 'free' | 'locked';

export function BatchListPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const { purchased, free, locked, loading, error, refresh } = useStudentBatches(search);

  const filtered = useMemo(() => {
    if (activeTab === 'purchased') return purchased;
    if (activeTab === 'free') return free;
    if (activeTab === 'locked') return locked;
    return [...purchased, ...free, ...locked];
  }, [activeTab, purchased, free, locked]);

  const tabs: { key: Tab; label: string; count: number; icon: typeof Layers }[] = [
    { key: 'all', label: 'All', count: purchased.length + free.length + locked.length, icon: Layers },
    { key: 'purchased', label: 'My Batches', count: purchased.length, icon: BookOpen },
    { key: 'free', label: 'Free', count: free.length, icon: Sparkles },
    { key: 'locked', label: 'Locked', count: locked.length, icon: Lock },
  ];

  if (loading) return <DashboardLoadingSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3">
        <p className="text-sm text-error-700">{error}</p>
        <button onClick={refresh} className="mt-2 text-xs text-primary-600 font-medium hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">My Batches</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Browse your enrolled batches, free content, and unlock new courses.</p>
      </div>

      <StudentDashboardGrid cols={4}>
        <StudentStatCard label="Enrolled" value={purchased.length} icon={BookOpen} color="primary" />
        <StudentStatCard label="Free Available" value={free.length} icon={Sparkles} color="success" />
        <StudentStatCard label="Locked" value={locked.length} icon={Lock} color="warning" />
        <StudentStatCard label="Total" value={purchased.length + free.length + locked.length} icon={Layers} color="accent" />
      </StudentDashboardGrid>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors', activeTab === tab.key ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50')}>
                <Icon className="h-4 w-4" />{tab.label}<span className={cn('rounded-full px-1.5 py-0.5 text-xs', activeTab === tab.key ? 'bg-white/20' : 'bg-neutral-100')}>{tab.count}</span>
              </button>
            );
          })}
        </div>
        <div className="w-full sm:w-64"><Input type="text" placeholder="Search batches..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      <StudentDashboardSection>
        {filtered.length > 0 ? (
          <StudentDashboardGrid cols={3}>
            {filtered.map((batch) => {
              const accessStatus = purchased.some((b) => b.id === batch.id) ? 'purchased' : batch.isFree ? 'free' : 'locked';
              return <StudentBatchListCard key={batch.id} batch={batch} accessStatus={accessStatus} />;
            })}
          </StudentDashboardGrid>
        ) : (
          <EmptyDashboard title={search ? 'No batches found' : 'No batches available'} description={search ? 'Try a different search term.' : 'Batches will appear here once they are published.'} />
        )}
      </StudentDashboardSection>
    </div>
  );
}
