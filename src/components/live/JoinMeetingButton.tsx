import { memo, useCallback } from 'react';
import { PlayCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { LiveClass } from '@/services/live';

interface JoinMeetingButtonProps {
  liveClass: LiveClass;
  onJoin: (liveClass: LiveClass) => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

function JoinMeetingButtonComponent({ liveClass, onJoin, disabled = false, className }: JoinMeetingButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onJoin(liveClass);
  }, [liveClass, onJoin]);

  const now = new Date();
  const start = new Date(liveClass.startTime);
  const end = new Date(liveClass.endTime);
  const isLive = start <= now && end >= now && liveClass.status !== 'cancelled';
  const isUpcoming = start > now;

  if (liveClass.status === 'cancelled') {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        Cancelled
      </Button>
    );
  }

  if (liveClass.status === 'completed' && !isLive) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        Completed
      </Button>
    );
  }

  if (isUpcoming && !isLive) {
    return (
      <Button variant="outline" size="sm" disabled={disabled} className={className}>
        <Lock className="h-3.5 w-3.5" /> Not Started
      </Button>
    );
  }

  return (
    <Button
      variant={isLive ? 'danger' : 'primary'}
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      <PlayCircle className="h-3.5 w-3.5" /> {isLive ? 'Join Now' : 'Join'}
    </Button>
  );
}

export const JoinMeetingButton = memo(JoinMeetingButtonComponent);
