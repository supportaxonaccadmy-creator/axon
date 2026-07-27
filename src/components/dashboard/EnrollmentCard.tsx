import { memo } from 'react';
import { GraduationCap, TrendingUp, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardEnrollmentSummary } from '@/types/adminDashboard';

interface EnrollmentCardProps { summary: DashboardEnrollmentSummary | null; loading?: boolean; }

function EnrollmentCardComponent({ summary, loading = false }: EnrollmentCardProps) {
  if (loading) return <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  const items = [
    { label: 'Active', value: summary?.activeEnrollments ?? 0, icon: Activity, color: 'text-primary-600 bg-primary-50' },
    { label: 'Completed', value: summary?.completedEnrollments ?? 0, icon: CheckCircle2, color: 'text-success-600 bg-success-50' },
    { label: 'Cancelled', value: summary?.cancelledEnrollments ?? 0, icon: XCircle, color: 'text-error-600 bg-error-50' },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><GraduationCap className="h-5 w-5 text-primary-600" strokeWidth={2} /></div><div><p className="text-xs text-neutral-500">Total Enrollments</p><p className="text-xl font-bold text-neutral-900">{summary?.totalEnrollments ?? 0}</p></div></div>
        <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', summary?.trend === 'up' ? 'bg-success-50 text-success-700' : summary?.trend === 'down' ? 'bg-error-50 text-error-700' : 'bg-neutral-50 text-neutral-500')}><TrendingUp className="h-3 w-3" />{summary?.trendPercent ?? 0}%</div>
      </div>
      <div className="grid grid-cols-3 gap-3">{items.map((item) => { const Icon = item.icon; return <div key={item.label} className="flex items-center gap-2 rounded-lg border border-neutral-100 p-2.5"><div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', item.color)}><Icon className="h-3.5 w-3.5" /></div><div><p className="text-sm font-bold text-neutral-900">{item.value}</p><p className="text-[10px] text-neutral-500">{item.label}</p></div></div>; })}</div>
    </div>
  );
}

export const EnrollmentCard = memo(EnrollmentCardComponent);
