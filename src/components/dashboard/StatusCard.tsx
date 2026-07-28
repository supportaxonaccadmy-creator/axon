import { memo } from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardSystemStatus, DashboardSystemStatusLevel } from '@/types/dashboard';

const STATUS_CONFIG: Record<DashboardSystemStatusLevel, { icon: typeof CheckCircle2; color: string; bg: string; dot: string; label: string }> = {
  operational:  { icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50', dot: 'bg-success-500', label: 'Operational' },
  degraded:     { icon: AlertCircle,  color: 'text-warning-600', bg: 'bg-warning-50', dot: 'bg-warning-500', label: 'Degraded' },
  outage:       { icon: XCircle,     color: 'text-error-600',   bg: 'bg-error-50',   dot: 'bg-error-500',   label: 'Outage' },
  down:         { icon: XCircle,     color: 'text-error-600',   bg: 'bg-error-50',   dot: 'bg-error-500',   label: 'Down' },
  maintenance:  { icon: AlertCircle,  color: 'text-warning-600', bg: 'bg-warning-50', dot: 'bg-warning-500', label: 'Maintenance' },
};

interface StatusCardProps {
  items: DashboardSystemStatus[];
}

function StatusCardComponent({ items }: StatusCardProps) {
  const allOperational = items.length > 0 && items.every((i) => i.status === 'operational');

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
        <div className={cn('h-2.5 w-2.5 rounded-full', allOperational ? 'bg-success-500 animate-pulse' : 'bg-warning-500')} />
        <p className="text-sm font-semibold text-neutral-800">
          {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
        </p>
      </div>
      <div className="divide-y divide-neutral-50">
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const Icon = config.icon;
          return (
            <div key={item.label} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', config.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', config.color)} />
                </div>
                <span className="text-sm text-neutral-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.latencyMs !== undefined && (
                  <span className="text-xs text-neutral-400 tabular-nums">{item.latencyMs}ms</span>
                )}
                <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const StatusCard = memo(StatusCardComponent);
