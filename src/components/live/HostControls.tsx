import { memo } from 'react';
import { Settings, Video, Users, Lock, Radio } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import type { LiveClass } from '@/services/live';

interface HostControlsProps {
  liveClass: LiveClass;
  onStart?: () => void;
  onEnd?: () => void;
  onCancel?: () => void;
  isHost?: boolean | undefined;
  className?: string | undefined;
}

function HostControlsComponent({ liveClass, onStart, onEnd, onCancel, isHost = true, className }: HostControlsProps) {
  if (!isHost) return null;

  const isLive = liveClass.status === 'live';
  const isScheduled = liveClass.status === 'scheduled';
  const isCompleted = liveClass.status === 'completed';
  const isCancelled = liveClass.status === 'cancelled';

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-4', className)}>
      <div className="mb-3 flex items-center gap-2">
        <Settings className="h-4 w-4 text-neutral-500" />
        <h3 className="text-sm font-semibold text-neutral-900">Host Controls</h3>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className={cn('flex items-center gap-2 rounded-lg border p-2 text-xs', liveClass.waitingRoom ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-neutral-100 text-neutral-500')}>
          <Lock className="h-3.5 w-3.5" /> Waiting Room
        </div>
        <div className={cn('flex items-center gap-2 rounded-lg border p-2 text-xs', liveClass.allowRecording ? 'border-green-200 bg-green-50 text-green-700' : 'border-neutral-100 text-neutral-500')}>
          <Video className="h-3.5 w-3.5" /> Recording
        </div>
        <div className={cn('flex items-center gap-2 rounded-lg border p-2 text-xs', liveClass.autoRecording ? 'border-green-200 bg-green-50 text-green-700' : 'border-neutral-100 text-neutral-500')}>
          <Radio className="h-3.5 w-3.5" /> Auto Record
        </div>
        {liveClass.maxParticipants && (
          <div className="flex items-center gap-2 rounded-lg border border-neutral-100 p-2 text-xs text-neutral-500">
            <Users className="h-3.5 w-3.5" /> Max {liveClass.maxParticipants}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isScheduled && onStart && (
          <Button size="sm" variant="danger" onClick={onStart}>
            <Radio className="h-3.5 w-3.5" /> Start Live
          </Button>
        )}
        {isLive && onEnd && (
          <Button size="sm" variant="primary" onClick={onEnd}>
            End Class
          </Button>
        )}
        {!isCancelled && !isCompleted && onCancel && (
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export const HostControls = memo(HostControlsComponent);
