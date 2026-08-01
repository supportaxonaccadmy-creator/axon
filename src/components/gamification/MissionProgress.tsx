import { memo } from 'react';
import { cn } from '@/utils/cn';
import type { Mission, StudentMission } from '@/services/gamification';

interface MissionProgressProps {
  mission: Mission;
  studentMission?: StudentMission | undefined;
  className?: string | undefined;
}

function MissionProgressComponent({ mission, studentMission, className }: MissionProgressProps) {
  const progress = studentMission?.progress ?? 0;
  const isCompleted = studentMission?.isCompleted ?? false;
  const progressPercent = Math.min(100, Math.round(progress * 100));

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">{mission.name}</span>
        <span className={cn('font-medium', isCompleted ? 'text-green-600' : 'text-neutral-700')}>{progressPercent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className={cn('h-full rounded-full transition-all', isCompleted ? 'bg-green-500' : 'bg-primary-500')} style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}

export const MissionProgress = memo(MissionProgressComponent);
