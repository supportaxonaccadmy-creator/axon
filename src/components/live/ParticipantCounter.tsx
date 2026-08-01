import { memo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import type { LiveClass } from '@/services/live';
import { attendanceService } from '@/services/live';

interface ParticipantCounterProps {
  liveClass: LiveClass;
  className?: string | undefined;
  refreshIntervalMs?: number;
}

function ParticipantCounterComponent({ liveClass, className, refreshIntervalMs = 5000 }: ParticipantCounterProps) {
  const [count, setCount] = useState(0);
  const [max, setMax] = useState(liveClass.maxParticipants);

  const fetchCount = useCallback(async () => {
    const { data } = await attendanceService.getCount(liveClass.id);
    setCount(data);
  }, [liveClass.id]);

  useEffect(() => {
    void fetchCount();
    const interval = setInterval(() => void fetchCount(), refreshIntervalMs);
    return () => clearInterval(interval);
  }, [fetchCount, refreshIntervalMs]);

  useEffect(() => {
    setMax(liveClass.maxParticipants);
  }, [liveClass.maxParticipants]);

  const isFull = max !== null && count >= max;
  const pct = max !== null && max > 0 ? Math.min(100, (count / max) * 100) : 0;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium', isFull ? 'bg-error-100 text-error-700' : 'bg-success-100 text-success-700')}>
        <Users className="h-4 w-4" />
        {count}
        {max !== null && <span className="text-neutral-400">/ {max}</span>}
      </div>
      {max !== null && (
        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200 sm:block">
          <div
            className={cn('h-full rounded-full transition-all', isFull ? 'bg-error-500' : 'bg-success-500')}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {isFull && (
        <span className="inline-flex items-center gap-1 text-xs text-error-600">
          <UserMinus className="h-3 w-3" />
          Full
        </span>
      )}
      {!isFull && count > 0 && max !== null && (
        <span className="inline-flex items-center gap-1 text-xs text-success-600">
          <UserPlus className="h-3 w-3" />
          {max - count} spots
        </span>
      )}
    </div>
  );
}

export const ParticipantCounter = memo(ParticipantCounterComponent);