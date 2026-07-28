import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2 } from 'lucide-react';
import { formatDuration } from '@/services/video';
import type { ContinueWatchingItem } from '@/services/video';

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem;
}

function ContinueWatchingCardComponent({ item }: ContinueWatchingCardProps) {
  const watchUrl = `/student/watch/${item.classSlug}`;
  return (
    <div className="group flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
      <Link to={watchUrl} className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.videoTitle} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-6 w-6 text-white/30" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-700">
          <div className="h-full bg-primary-500" style={{ width: `${item.completedPercentage}%` }} />
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900">{item.videoTitle}</p>
        <p className="mt-0.5 text-xs text-neutral-500">
          {formatDuration(item.durationSeconds)} · {item.completedPercentage}% complete
        </p>
        <div className="mt-2 flex items-center gap-2">
          {item.isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-medium text-success-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          ) : (
            <Link to={watchUrl} className="flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700">
              <Play className="h-3 w-3" /> Resume
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export const ContinueWatchingCard = memo(ContinueWatchingCardComponent);
