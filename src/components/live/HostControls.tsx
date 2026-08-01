import { memo, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Play, Square, Ban, Settings, Users, Video } from 'lucide-react';
import type { LiveClass } from '@/services/live';
import { isLiveNow } from '@/services/live';

interface HostControlsProps {
  liveClass: LiveClass;
  onStart?: (liveClass: LiveClass) => void;
  onEnd?: (liveClass: LiveClass) => void;
  onCancel?: (liveClass: LiveClass) => void;
  onSettings?: (liveClass: LiveClass) => void;
  className?: string | undefined;
}

function HostControlsComponent({ liveClass, onStart, onEnd, onCancel, onSettings, className }: HostControlsProps) {
  const live = isLiveNow(liveClass);
  const isCompleted = liveClass.status === 'completed';
  const isCancelled = liveClass.status === 'cancelled';

  const handleStart = useCallback(() => onStart?.(liveClass), [onStart, liveClass]);
  const handleEnd = useCallback(() => onEnd?.(liveClass), [onEnd, liveClass]);
  const handleCancel = useCallback(() => onCancel?.(liveClass), [onCancel, liveClass]);
  const handleSettings = useCallback(() => onSettings?.(liveClass), [onSettings, liveClass]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Host Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="success" onClick={handleStart} disabled={live || isCompleted || isCancelled}>
            <Play className="h-4 w-4" />
            Start Class
          </Button>
          <Button size="sm" variant="danger" onClick={handleEnd} disabled={!live}>
            <Square className="h-4 w-4" />
            End Class
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={isCompleted || isCancelled}>
            <Ban className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          {onSettings && (
            <Button size="sm" variant="ghost" onClick={handleSettings}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          )}
          {liveClass.waitingRoom && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-700">
              <Users className="h-3 w-3" />
              Waiting Room On
            </span>
          )}
          {liveClass.allowRecording && (
            <span className="inline-flex items-center gap-1 rounded-full bg-info-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              <Video className="h-3 w-3" />
              Recording Allowed
            </span>
          )}
          {liveClass.autoRecording && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-700">
              <Video className="h-3 w-3" />
              Auto-Recording
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const HostControls = memo(HostControlsComponent);