import { memo } from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ParticipantCounterProps {
  current: number;
  max?: number | null;
  className?: string | undefined;
}

function ParticipantCounterComponent({ current, max, className }: ParticipantCounterProps) {
  const isFull = max != null && current >= max;

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', isFull ? 'text-red-600' : 'text-neutral-500', className)}>
      <Users className="h-3.5 w-3.5" />
      <span className="font-medium">{current}</span>
      {max != null && <span className="text-neutral-400">/ {max}</span>}
      <span className="text-neutral-400">participants</span>
    </div>
  );
}

export const ParticipantCounter = memo(ParticipantCounterComponent);
