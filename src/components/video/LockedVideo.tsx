import { memo } from 'react';
import { Lock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

interface LockedVideoProps {
  batchSlug?: string | undefined;
  message?: string | undefined;
}

function LockedVideoComponent({ batchSlug, message }: LockedVideoProps) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-900 text-center">
      <Lock className="h-12 w-12 text-neutral-500" />
      <p className="mt-3 max-w-xs text-sm font-medium text-white/80">
        {message ?? 'Purchase this batch to access this class'}
      </p>
      {batchSlug && (
        <Link to={`/student/checkout/${batchSlug}`} className="mt-4">
          <Button size="sm" variant="primary">
            <PlayCircle className="h-4 w-4" /> Unlock Now
          </Button>
        </Link>
      )}
    </div>
  );
}

export const LockedVideo = memo(LockedVideoComponent);
