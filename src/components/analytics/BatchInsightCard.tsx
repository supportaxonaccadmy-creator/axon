import { memo } from 'react';
import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { BatchAnalyticsSummary } from '@/services/analytics';

interface BatchInsightCardProps { summary: BatchAnalyticsSummary; onClick?: (batchId: string) => void; }

function BatchInsightCardComponent({ summary, onClick }: BatchInsightCardProps) {
  return (
    <div className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md" onClick={() => onClick?.(summary.batchId)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(summary.batchId); }}>
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Users className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Batch Overview</h3></div></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-neutral-50 p-3 text-center"><p className="text-xl font-bold text-neutral-900">{summary.totalStudents}</p><p className="text-xs text-neutral-500">Students</p></div>
        <div className="rounded-lg bg-success-50 p-3 text-center"><p className="text-xl font-bold text-success-700">{summary.activeStudents}</p><p className="text-xs text-neutral-500">Active</p></div>
        <div className="rounded-lg bg-warning-50 p-3 text-center"><p className="text-xl font-bold text-warning-700">{summary.atRiskCount}</p><p className="text-xs text-neutral-500">At Risk</p></div>
        <div className="rounded-lg bg-primary-50 p-3 text-center"><p className="text-xl font-bold text-primary-700">{summary.retentionRate.toFixed(0)}%</p><p className="text-xs text-neutral-500">Retention</p></div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Avg Score: {summary.averageScore.toFixed(1)}</span>
        <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completion: {summary.averageCompletion.toFixed(1)}%</span>
        {summary.churnRate > 0 && <span className={cn('flex items-center gap-1', summary.churnRate > 10 ? 'text-error-600' : 'text-neutral-500')}><AlertTriangle className="h-3 w-3" /> Churn: {summary.churnRate.toFixed(1)}%</span>}
      </div>
    </div>
  );
}
export const BatchInsightCard = memo(BatchInsightCardComponent);
