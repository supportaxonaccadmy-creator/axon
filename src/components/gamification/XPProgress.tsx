import { memo } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

interface XPProgressProps {
  totalXp: number;
  level: number;
  xpForCurrent: number;
  xpForNext: number;
  className?: string | undefined;
}

function XPProgressComponent({ totalXp, level, xpForCurrent, xpForNext, className }: XPProgressProps) {
  const progress = xpForNext > 0 ? Math.min(100, Math.round(((totalXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100)) : 100;
  const remaining = Math.max(0, xpForNext - totalXp);

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-4', className)}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
            <Zap className="h-4 w-4 text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{totalXp.toLocaleString()} XP</p>
            <p className="text-[11px] text-neutral-400">Level {level}</p>
          </div>
        </div>
        <p className="text-xs text-neutral-400">{remaining} XP to Level {level + 1}</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1 text-right text-[10px] text-neutral-400">{progress}%</p>
    </div>
  );
}

export const XPProgress = memo(XPProgressComponent);
