import { memo } from 'react';
import { IndianRupee, TrendingUp, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardRevenueSummary } from '@/types/adminDashboard';

interface RevenueCardProps { summary: DashboardRevenueSummary | null; loading?: boolean; }

function RevenueCardComponent({ summary, loading = false }: RevenueCardProps) {
  if (loading) return <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  const items = [
    { label: 'Completed', value: summary?.completedCount ?? 0, icon: CheckCircle2, color: 'text-success-600 bg-success-50' },
    { label: 'Pending', value: summary?.pendingCount ?? 0, icon: Clock, color: 'text-warning-600 bg-warning-50' },
    { label: 'Failed', value: summary?.failedCount ?? 0, icon: XCircle, color: 'text-error-600 bg-error-50' },
    { label: 'Refunded', value: summary?.refundedCount ?? 0, icon: RefreshCw, color: 'text-neutral-600 bg-neutral-100' },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50"><IndianRupee className="h-5 w-5 text-success-600" strokeWidth={2} /></div><div><p className="text-xs text-neutral-500">Total Revenue</p><p className="text-xl font-bold text-neutral-900">₹{(summary?.totalRevenue ?? 0).toLocaleString('en-IN')}</p></div></div>
        <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', summary?.trend === 'up' ? 'bg-success-50 text-success-700' : summary?.trend === 'down' ? 'bg-error-50 text-error-700' : 'bg-neutral-50 text-neutral-500')}><TrendingUp className="h-3 w-3" />{summary?.trendPercent ?? 0}%</div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map((item) => { const Icon = item.icon; return <div key={item.label} className="flex items-center gap-2 rounded-lg border border-neutral-100 p-2.5"><div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', item.color)}><Icon className="h-3.5 w-3.5" /></div><div><p className="text-sm font-bold text-neutral-900">{item.value}</p><p className="text-[10px] text-neutral-500">{item.label}</p></div></div>; })}</div>
    </div>
  );
}

export const RevenueCard = memo(RevenueCardComponent);
