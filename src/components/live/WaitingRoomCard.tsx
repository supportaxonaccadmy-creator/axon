import { memo } from 'react';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/services/live';
import type { LiveClass } from '@/services/live';

interface WaitingRoomCardProps {
  liveClass: LiveClass;
  className?: string | undefined;
}

function WaitingRoomCardComponent({ liveClass, className }: WaitingRoomCardProps) {
  return (
    <div className={cn('rounded-xl border border-amber-200 bg-amber-50 p-6 text-center', className)}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-6 w-6 text-amber-600" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900">Waiting Room</h3>
      <p className="mt-1 text-sm text-neutral-600">{liveClass.title}</p>
      <p className="mt-2 text-xs text-neutral-500">
        Starts at {formatDateTime(liveClass.startTime, liveClass.timezone)}
      </p>
      {liveClass.maxParticipants && (
        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-neutral-400">
          <Users className="h-3 w-3" /> Max {liveClass.maxParticipants} participants
        </p>
      )}
    </div>
  );
}

export const WaitingRoomCard = memo(WaitingRoomCardComponent);
