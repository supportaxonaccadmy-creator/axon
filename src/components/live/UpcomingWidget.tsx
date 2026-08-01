import { memo } from 'react';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { LiveStatusBadge } from './LiveStatusBadge';
import { MeetingProviderBadge } from './MeetingProviderBadge';
import { formatDateTime } from '@/services/live';
import type { LiveClass } from '@/services/live';

interface UpcomingWidgetProps {
  liveClasses: LiveClass[];
  loading?: boolean | undefined;
  onViewAll?: () => void;
  onClassClick?: (liveClass: LiveClass) => void;
  className?: string | undefined;
}

function UpcomingWidgetComponent({ liveClasses, loading, onViewAll, onClassClick, className }: UpcomingWidgetProps) {
  const upcoming = liveClasses
    .filter((c) => new Date(c.startTime) > new Date() && c.status !== 'cancelled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-5 shadow-sm', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900">Upcoming Classes</h3>
        </div>
        {onViewAll && (
          <button onClick={onViewAll} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-neutral-500">Loading...</div>
      ) : upcoming.length === 0 ? (
        <div className="py-6 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-neutral-300" />
          <p className="mt-2 text-sm text-neutral-500">No upcoming classes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((lc) => (
            <button
              key={lc.id}
              onClick={() => onClassClick?.(lc)}
              className="flex w-full items-center gap-3 rounded-lg border border-neutral-100 p-2.5 text-left transition-colors hover:bg-neutral-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">{lc.title}</p>
                <p className="text-xs text-neutral-400">{formatDateTime(lc.startTime, lc.timezone)}</p>
              </div>
              <MeetingProviderBadge providerType={lc.providerType} />
              <LiveStatusBadge status={lc.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const UpcomingWidget = memo(UpcomingWidgetComponent);
