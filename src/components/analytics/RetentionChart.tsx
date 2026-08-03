import { memo, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { RETENTION_STATUS_LABELS } from '@/services/analytics';
import type { RetentionMetric } from '@/services/analytics';

interface RetentionChartProps {
  data: RetentionMetric[];
}

const statusColors: Record<string, string> = {
  active: 'bg-success-500',
  at_risk: 'bg-warning-500',
  dormant: 'bg-orange-500',
  churned: 'bg-error-500',
};

function RetentionChartComponent({ data }: RetentionChartProps) {
  const distribution = useMemo(() => {
    const counts = { active: 0, at_risk: 0, dormant: 0, churned: 0 };
    for (const d of data) counts[d.retentionStatus]++;
    return counts;
  }, [data]);

  const total = data.length || 1;

  return (
    <div className="space-y-4">
      <div className="flex h-8 overflow-hidden rounded-lg">
        {Object.entries(distribution).map(([status, count]) => (
          <div
            key={status}
            className={cn('flex items-center justify-center text-xs font-medium text-white transition-all', statusColors[status])}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${RETENTION_STATUS_LABELS[status as keyof typeof RETENTION_STATUS_LABELS]}: ${count}`}
          >
            {count > 0 && count}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(distribution).map(([status, count]) => (
          <div key={status} className="rounded-lg border border-neutral-200 p-3">
            <div className="flex items-center gap-2">
              <div className={cn('h-3 w-3 rounded-full', statusColors[status])} />
              <span className="text-xs font-medium text-neutral-600">{RETENTION_STATUS_LABELS[status as keyof typeof RETENTION_STATUS_LABELS]}</span>
            </div>
            <p className="mt-1 text-xl font-bold text-neutral-900">{count}</p>
            <p className="text-xs text-neutral-400">{((count / total) * 100).toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const RetentionChart = memo(RetentionChartComponent);
