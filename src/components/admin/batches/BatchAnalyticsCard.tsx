import { memo } from 'react';
import { Users, ShoppingCart, IndianRupee, BookOpen, Video } from 'lucide-react';
import type { BatchStatistics } from '@/services/lms/statisticsService';

interface BatchAnalyticsCardProps {
  stats: BatchStatistics | null;
  enrollmentCount: number;
  purchaseCount: number;
  revenue: number;
  loading?: boolean;
}

function BatchAnalyticsCardComponent({ stats, enrollmentCount, purchaseCount, revenue, loading = false }: BatchAnalyticsCardProps) {
  if (loading) return <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  const items = [
    { label: 'Total Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success-600 bg-success-50' },
    { label: 'Total Students', value: enrollmentCount, icon: Users, color: 'text-primary-600 bg-primary-50' },
    { label: 'Purchases', value: purchaseCount, icon: ShoppingCart, color: 'text-accent-600 bg-accent-50' },
    { label: 'Subjects', value: stats?.subjectCount ?? 0, icon: BookOpen, color: 'text-primary-600 bg-primary-50' },
    { label: 'Chapters', value: stats?.chapterCount ?? 0, icon: BookOpen, color: 'text-accent-600 bg-accent-50' },
    { label: 'Classes', value: stats?.classCount ?? 0, icon: Video, color: 'text-primary-600 bg-primary-50' },
    { label: 'Videos', value: stats?.videoCount ?? 0, icon: Video, color: 'text-success-600 bg-success-50' },
    { label: 'PDF Notes', value: stats?.pdfCount ?? 0, icon: BookOpen, color: 'text-accent-600 bg-accent-50' },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Batch Analytics</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => { const Icon = item.icon; return (
          <div key={item.label} className="flex flex-col gap-2 rounded-lg border border-neutral-100 p-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}><Icon className="h-4 w-4" /></div>
            <div><p className="text-lg font-bold text-neutral-900">{item.value}</p><p className="text-[10px] text-neutral-500">{item.label}</p></div>
          </div>
        ); })}
      </div>
    </div>
  );
}

export const BatchAnalyticsCard = memo(BatchAnalyticsCardComponent);
