import { memo } from 'react';
import { Target, Check, Gift } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { MISSION_TYPE_LABELS } from '@/services/gamification';
import type { Mission, StudentMission } from '@/services/gamification';

interface MissionCardProps {
  mission: Mission;
  studentMission?: StudentMission | undefined;
  onClaim?: (missionId: string) => void;
  claiming?: boolean | undefined;
  className?: string | undefined;
}

function MissionCardComponent({ mission, studentMission, onClaim, claiming = false, className }: MissionCardProps) {
  const progress = studentMission?.progress ?? 0;
  const isCompleted = studentMission?.isCompleted ?? false;
  const isClaimed = studentMission?.isRewardClaimed ?? false;
  const progressPercent = Math.min(100, Math.round(progress * 100));

  return (
    <div className={cn(
      'rounded-xl border bg-white p-4 shadow-sm transition-all',
      isCompleted ? 'border-green-200' : 'border-neutral-200',
      className,
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          isCompleted ? 'bg-green-50' : 'bg-primary-50',
        )}>
          {isCompleted ? <Check className="h-5 w-5 text-green-500" /> : <Target className="h-5 w-5 text-primary-500" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">{mission.name}</h3>
              <p className="text-[11px] text-neutral-400">{MISSION_TYPE_LABELS[mission.type]}</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {mission.targetCount}x
            </span>
          </div>

          {mission.description && <p className="mt-1 text-xs text-neutral-500">{mission.description}</p>}

          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div className={cn('h-full rounded-full transition-all', isCompleted ? 'bg-green-500' : 'bg-primary-500')} style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-neutral-400">{progressPercent}% complete</p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {mission.xpReward > 0 && <span className="text-xs text-primary-600">+{mission.xpReward} XP</span>}
            {mission.pointsReward > 0 && <span className="text-xs text-amber-600">+{mission.pointsReward} pts</span>}
          </div>

          {isCompleted && !isClaimed && onClaim && (
            <Button size="sm" className="mt-3" onClick={() => onClaim(mission.id)} loading={claiming}>
              <Gift className="h-3.5 w-3.5" /> Claim Reward
            </Button>
          )}
          {isClaimed && <p className="mt-2 text-xs text-green-600">Reward claimed</p>}
        </div>
      </div>
    </div>
  );
}

export const MissionCard = memo(MissionCardComponent);
