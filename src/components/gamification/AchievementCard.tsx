import { memo } from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { ACHIEVEMENT_CATEGORY_LABELS, ACHIEVEMENT_CATEGORY_COLORS, formatRelativeTime } from '@/services/gamification';
import type { Achievement } from '@/services/gamification';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked?: boolean | undefined;
  unlockedAt?: string | undefined;
  className?: string | undefined;
}

function AchievementCardComponent({ achievement, unlocked = false, unlockedAt, className }: AchievementCardProps) {
  return (
    <div className={cn(
      'rounded-xl border bg-white p-4 shadow-sm transition-all',
      unlocked ? 'border-primary-200 hover:shadow-md' : 'border-neutral-200 opacity-60',
      className,
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          unlocked ? 'bg-primary-50' : 'bg-neutral-100',
        )}>
          <Trophy className={cn('h-5 w-5', unlocked ? 'text-primary-500' : 'text-neutral-300')} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-neutral-900">{achievement.name}</h3>
          {achievement.description && <p className="mt-0.5 text-xs text-neutral-500">{achievement.description}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', ACHIEVEMENT_CATEGORY_COLORS[achievement.category])}>
              {ACHIEVEMENT_CATEGORY_LABELS[achievement.category]}
            </span>
            {achievement.xpReward > 0 && <Badge variant="info">+{achievement.xpReward} XP</Badge>}
            {achievement.pointsReward > 0 && <Badge variant="warning">+{achievement.pointsReward} pts</Badge>}
          </div>

          {unlocked && unlockedAt && (
            <p className="mt-2 text-[11px] text-neutral-400">Unlocked {formatRelativeTime(unlockedAt)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export const AchievementCard = memo(AchievementCardComponent);
