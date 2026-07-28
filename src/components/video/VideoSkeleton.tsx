import { memo } from 'react';

function VideoSkeletonComponent() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900">
      <div className="absolute inset-0 animate-pulse bg-neutral-800" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-700" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 animate-pulse bg-neutral-800/80" />
    </div>
  );
}

export const VideoSkeleton = memo(VideoSkeletonComponent);
