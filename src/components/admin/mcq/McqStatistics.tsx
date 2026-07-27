import { memo } from 'react';
import { FileQuestion, HelpCircle, CheckCircle2, Clock, Award, TrendingDown } from 'lucide-react';
import type { McqQuestionStats } from '@/hooks/useAdminMcq';

interface McqStatisticsProps {
  stats: McqQuestionStats;
  loading?: boolean;
}

function McqStatisticsComponent({ stats, loading = false }: McqStatisticsProps) {
  if (loading) return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />)}</div>;

  const items = [
    { label: 'Total Questions', value: stats.total, icon: HelpCircle, color: 'text-primary-600 bg-primary-50' },
    { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-success-600 bg-success-50' },
    { label: 'Draft', value: stats.draft, icon: FileQuestion, color: 'text-warning-600 bg-warning-50' },
    { label: 'Archived', value: stats.archived, icon: Clock, color: 'text-neutral-500 bg-neutral-100' },
    { label: 'Avg Marks', value: stats.avgMarks.toFixed(1), icon: Award, color: 'text-accent-600 bg-accent-50' },
    { label: 'Avg Neg Marks', value: stats.avgNegativeMarks.toFixed(1), icon: TrendingDown, color: 'text-error-600 bg-error-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => { const Icon = item.icon; return (
        <div key={item.label} className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color}`}><Icon className="h-4 w-4" /></div>
          <div><p className="text-xl font-bold text-neutral-900">{item.value}</p><p className="text-xs text-neutral-500">{item.label}</p></div>
        </div>
      ); })}
    </div>
  );
}

export const McqStatistics = memo(McqStatisticsComponent);
