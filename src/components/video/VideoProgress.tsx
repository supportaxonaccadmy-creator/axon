import { memo } from 'react';
import { formatDuration } from '@/services/video';

interface VideoProgressProps {
  current: number;
  duration: number;
  buffered?: number | undefined;
  onSeek: (time: number) => void;
}

function VideoProgressComponent({ current, duration, buffered, onSeek }: VideoProgressProps) {
  const pct = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = buffered && duration > 0 ? (buffered / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    onSeek(time);
  };

  return (
    <div className="group/progress relative flex items-center gap-2 px-3 py-1">
      <span className="text-xs font-medium text-white/80 tabular-nums">{formatDuration(current)}</span>
      <div
        className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/20"
        onClick={handleClick}
      >
        {bufferedPct > 0 && (
          <div className="absolute h-full rounded-full bg-white/30" style={{ width: `${bufferedPct}%` }} />
        )}
        <div
          className="absolute h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-400 opacity-0 shadow group-hover/progress:opacity-100 transition-opacity" />
        </div>
      </div>
      <span className="text-xs font-medium text-white/80 tabular-nums">{formatDuration(duration)}</span>
    </div>
  );
}

export const VideoProgress = memo(VideoProgressComponent);
