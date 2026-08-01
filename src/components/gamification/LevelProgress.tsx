import { memo } from 'react';
import { cn } from '@/utils/cn';

interface LevelProgressProps {
  currentLevel: number;
  xpForCurrent: number;
  xpForNext: number;
  totalXp: number;
  className?: string | undefined;
}

function LevelProgressComponent({ currentLevel, xpForCurrent, xpForNext, totalXp, className }: LevelProgressProps) {
  const progress = xpForNext > 0 ? Math.min(100, Math.round(((totalXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100)) : 100;

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400">Current Level</p>
          <p className="text-2xl font-bold text-neutral-900">{currentLevel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">Next Level</p>
          <p className="text-2xl font-bold text-neutral-300">{currentLevel + 1}</p>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-neutral-400">
        <span>{xpForCurrent.toLocaleString()} XP</span>
        <span>{xpForNext.toLocaleString()} XP</span>
      </div>
    </div>
  );
}

export const LevelProgress = memo(LevelProgressComponent);
