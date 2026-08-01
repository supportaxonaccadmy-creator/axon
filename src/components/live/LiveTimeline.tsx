import { memo } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDateTime, formatDuration } from '@/services/live';
import type { LiveAttendance } from '@/services/live';

interface LiveTimelineProps {
  attendance: LiveAttendance[];
  className?: string | undefined;
}

function LiveTimelineComponent({ attendance, className }: LiveTimelineProps) {
  const sorted = [...attendance].sort((a, b) => {
    const aTime = a.joinTime ? new Date(a.joinTime).getTime() : 0;
    const bTime = b.joinTime ? new Date(b.joinTime).getTime() : 0;
    return aTime - bTime;
  });

  return (
    <div className={cn('space-y-2', className)}>
      {sorted.length === 0 ? (
        <p className="py-4 text-center text-sm text-neutral-500">No attendance data</p>
      ) : (
        sorted.map((record) => (
          <div key={record.id} className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3">
            <div className="flex flex-col items-center">
              {record.joinTime && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <LogIn className="h-3 w-3" />
                </div>
              )}
              {record.leaveTime && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                  <LogOut className="h-3 w-3" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              {record.joinTime && (
                <p className="text-neutral-600">
                  Joined at {formatDateTime(record.joinTime)}
                </p>
              )}
              {record.leaveTime && (
                <p className="mt-1 text-neutral-600">
                  Left at {formatDateTime(record.leaveTime)}
                </p>
              )}
              {record.durationSeconds > 0 && (
                <p className="mt-1 flex items-center gap-1 text-neutral-400">
                  <Clock className="h-3 w-3" /> {formatDuration(record.durationSeconds)}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export const LiveTimeline = memo(LiveTimelineComponent);
