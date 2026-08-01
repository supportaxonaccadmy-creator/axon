import { memo } from 'react';
import { cn } from '@/utils/cn';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
};

function LevelBadgeComponent({ level, size = 'md', className }: LevelBadgeProps) {
  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white shadow-md',
      SIZES[size],
      className,
    )}>
      {level}
    </div>
  );
}

export const LevelBadge = memo(LevelBadgeComponent);
