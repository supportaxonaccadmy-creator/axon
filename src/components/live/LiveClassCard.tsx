import { memo } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, Users, Video, MoreVertical } from 'lucide-react';
import type { LiveClass } from '@/services/live';
import { formatDateTime, isLiveNow, isUpcoming } from '@/services/live';
import { LiveStatusBadge } from './LiveStatusBadge';
import { MeetingProviderBadge } from './MeetingProviderBadge';

interface LiveClassCardProps {
  liveClass: LiveClass;
  onJoin?: (liveClass: LiveClass) => void;
  onEdit?: (liveClass: LiveClass) => void;
  onDelete?: (liveClass: LiveClass) => void;
  className?: string | undefined;
}

function LiveClassCardComponent({ liveClass, onJoin, onEdit, onDelete, className }: LiveClassCardProps) {
  const live = isLiveNow(liveClass);
  const upcoming = isUpcoming(liveClass);

  return (
    <Card hover className={cn('overflow-hidden', className)}>
      {liveClass.bannerUrl && (
        <div className="h-32 w-full bg-neutral-100" style={{ backgroundImage: `url(${liveClass.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-900">{liveClass.title}</h3>
            {liveClass.description && <p className="text-sm text-neutral-600 line-clamp-2">{liveClass.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <LiveStatusBadge status={liveClass.status} />
            {onEdit && (
              <button type="button" onClick={() => onEdit(liveClass)} className="text-neutral-400 hover:text-neutral-600" aria-label="Edit">
                <MoreVertical className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateTime(liveClass.startTime, liveClass.timezone)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(liveClass.endTime, liveClass.timezone)}
          </span>
          {liveClass.maxParticipants && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {liveClass.maxParticipants}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <MeetingProviderBadge providerType={liveClass.providerType} />
          {liveClass.waitingRoom && (
            <Badge variant="default" className="text-xs">
              <Video className="mr-1 h-3 w-3" />
              Waiting Room
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {live && onJoin && (
            <Button size="sm" variant="danger" onClick={() => onJoin(liveClass)}>
              Join Now
            </Button>
          )}
          {upcoming && onJoin && (
            <Button size="sm" variant="primary" onClick={() => onJoin(liveClass)} disabled={!liveClass.meetingUrl}>
              {liveClass.meetingUrl ? 'Join Meeting' : 'No URL'}
            </Button>
          )}
          {onDelete && !live && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(liveClass)}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const LiveClassCard = memo(LiveClassCardComponent);