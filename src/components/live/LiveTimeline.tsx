import { memo } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Circle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { LiveClass } from '@/services/live';
import { formatDateTime, isLiveNow, isUpcoming } from '@/services/live';

interface LiveTimelineProps {
  liveClass: LiveClass;
  className?: string | undefined;
}

type TimelineStage = 'before_start' | 'live' | 'after_end' | 'completed' | 'cancelled';

function LiveTimelineComponent({ liveClass, className }: LiveTimelineProps) {
  const isCancelled = liveClass.status === 'cancelled';
  const isCompleted = liveClass.status === 'completed';
  const live = isLiveNow(liveClass);
  const upcoming = isUpcoming(liveClass);

  let stage: TimelineStage;
  if (isCancelled) stage = 'cancelled';
  else if (isCompleted) stage = 'completed';
  else if (live) stage = 'live';
  else if (upcoming) stage = 'before_start';
  else stage = 'after_end';

  const steps = [
    {
      label: 'Scheduled',
      time: formatDateTime(liveClass.startTime, liveClass.timezone),
      done: stage !== 'before_start',
      active: stage === 'before_start',
      cancelled: stage === 'cancelled',
    },
    {
      label: 'Live',
      time: live ? 'In Progress' : 'Waiting',
      done: stage === 'completed' || stage === 'after_end',
      active: stage === 'live',
      cancelled: stage === 'cancelled',
    },
    {
      label: 'Completed',
      time: formatDateTime(liveClass.endTime, liveClass.timezone),
      done: stage === 'completed',
      active: stage === 'after_end',
      cancelled: stage === 'cancelled',
    },
  ];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Class Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          {steps.map((step, i) => {
            const Icon = step.cancelled
              ? XCircle
              : step.done
                ? CheckCircle2
                : step.active
                  ? Clock
                  : Circle;
            return (
              <div key={step.label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                      step.cancelled && 'border-error-200 bg-error-50 text-error-400',
                      step.done && !step.cancelled && 'border-success-500 bg-success-500 text-white',
                      step.active && !step.cancelled && 'border-primary-500 bg-primary-50 text-primary-600',
                      !step.done && !step.active && !step.cancelled && 'border-neutral-200 bg-neutral-50 text-neutral-300',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn('mt-1.5 text-xs font-medium', step.done || step.active ? 'text-neutral-900' : 'text-neutral-400')}>
                    {step.label}
                  </span>
                  <span className="text-xs text-neutral-400">{step.time}</span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1 rounded-full',
                      step.done && !step.cancelled ? 'bg-success-500' : 'bg-neutral-200',
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        {isCancelled && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-error-50 py-2 text-sm text-error-700">
            <XCircle className="h-4 w-4" />
            This class was cancelled
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const LiveTimeline = memo(LiveTimelineComponent);