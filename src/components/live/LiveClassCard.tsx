import { memo } from 'react';
import { Video, Clock, Users, PlayCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { LiveStatusBadge } from './LiveStatusBadge';
import { MeetingProviderBadge } from './MeetingProviderBadge';
import { formatDateTime, isLiveNow, isUpcoming } from '@/services/live';
import type { LiveClass } from '@/services/live';

interface LiveClassCardProps {
  liveClass: LiveClass;
  onClick?: (liveClass: LiveClass) => void;
  onJoin?: (liveClass: LiveClass) => void;
  showActions?: boolean;
  className?: string | undefined;
}

function LiveClassCardComponent({ liveClass, onClick, onJoin, showActions = true, className }: LiveClassCardProps) {
  const live = isLiveNow(liveClass.startTime, liveClass.endTime, liveClass.status);
  const upcoming = isUpcoming(liveClass.startTime);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={() => onClick?.(liveClass)}
      role={onClick ? 'button' : undefined}
    >
      {liveClass.thumbnailUrl && (
        <div className="relative h-32 overflow-hidden bg-neutral-100">
          <img src={liveClass.thumbnailUrl} alt={liveClass.title} className="h-full w-full object-cover" />
          {live && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <LiveStatusBadge status={liveClass.status} />
          <MeetingProviderBadge providerType={liveClass.providerType} />
        </div>

        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1">{liveClass.title}</h3>
        {liveClass.description && (
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{liveClass.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDateTime(liveClass.startTime, liveClass.timezone)}
          </span>
          {liveClass.maxParticipants && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> Max {liveClass.maxParticipants}
            </span>
          )}
          {liveClass.waitingRoom && (
            <span className="flex items-center gap-1">
              <Video className="h-3 w-3" /> Waiting Room
            </span>
          )}
        </div>

        {showActions && onJoin && (live || upcoming) && (
          <button
            onClick={(e) => { e.stopPropagation(); onJoin(liveClass); }}
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              live ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary-600 text-white hover:bg-primary-700',
            )}
          >
            <PlayCircle className="h-4 w-4" /> {live ? 'Join Now' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
}

export const LiveClassCard = memo(LiveClassCardComponent);
