import { memo, useEffect, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface McqTimerProps {
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  onTick: () => void;
  onExpire: () => void;
  paused?: boolean;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function McqTimerComponent({ timeRemainingSeconds, totalDurationSeconds, onTick, onExpire, paused = false }: McqTimerProps) {
  const expiredRef = useRef(false);
  const percent = totalDurationSeconds > 0 ? (timeRemainingSeconds / totalDurationSeconds) * 100 : 0;
  const isCritical = timeRemainingSeconds <= 30 && timeRemainingSeconds > 0;
  const isExpired = timeRemainingSeconds <= 0;

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => { onTick(); }, 1000);
    return () => clearInterval(interval);
  }, [onTick, paused]);

  useEffect(() => {
    if (isExpired && !expiredRef.current) { expiredRef.current = true; onExpire(); }
  }, [isExpired, onExpire]);

  return (
    <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-sm font-bold tabular-nums transition-colors', isExpired ? 'border-error-300 bg-error-50 text-error-700' : isCritical ? 'border-error-300 bg-error-50 text-error-700 animate-pulse' : 'border-neutral-200 bg-white text-neutral-700')}>
      {isExpired || isCritical ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      <span>{isExpired ? 'Time Expired' : formatTime(timeRemainingSeconds)}</span>
      {!isExpired && <div className="ml-1 h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100"><div className={cn('h-full rounded-full transition-all', isCritical ? 'bg-error-500' : 'bg-primary-500')} style={{ width: `${percent}%` }} /></div>}
    </div>
  );
}

export const McqTimer = memo(McqTimerComponent);
