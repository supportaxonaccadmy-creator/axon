import { memo } from 'react';
import { PLAYBACK_SPEEDS } from '@/services/video';
import type { PlaybackSpeed as PlaybackSpeedType } from '@/services/video';
import { cn } from '@/utils/cn';

interface PlaybackSpeedProps {
  current: PlaybackSpeedType;
  onChange: (speed: PlaybackSpeedType) => void;
}

function PlaybackSpeedComponent({ current, onChange }: PlaybackSpeedProps): JSX.Element {
  return (
    <div className="flex items-center gap-1">
      {PLAYBACK_SPEEDS.map((speed) => (
        <button
          key={speed}
          onClick={() => onChange(speed)}
          className={cn(
            'rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
            current === speed
              ? 'bg-primary-500 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          )}
        >
          {speed}x
        </button>
      ))}
    </div>
  );
}

export const PlaybackSpeedControl = memo(PlaybackSpeedComponent);
