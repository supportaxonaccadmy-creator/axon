import { memo } from 'react';
import { cn } from '@/utils/cn';
import { BADGE_TIER_COLORS, BADGE_TIER_LABELS, formatRelativeTime } from '@/services/gamification';
import type { Badge } from '@/services/gamification';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean | undefined;
  earnedAt?: string | undefined;
  className?: string | undefined;
}

function BadgeCardComponent({ badge, earned = false, earnedAt, className }: BadgeCardProps) {
  return (
    <div className={cn(
      'overflow-hidden rounded-xl border bg-white shadow-sm transition-all',
      earned ? 'border-neutral-200 hover:shadow-md' : 'border-neutral-200 opacity-50',
      className,
    )}>
      <div className={cn('flex h-24 items-center justify-center bg-gradient-to-br', BADGE_TIER_COLORS[badge.tier])}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <span className="text-2xl font-bold text-white">{badge.icon ?? '🏆'}</span>
        </div>
      </div>

      <div className="p-3 text-center">
        <h3 className="text-sm font-semibold text-neutral-900">{badge.name}</h3>
        <p className="text-[11px] text-neutral-400">{BADGE_TIER_LABELS[badge.tier]}</p>
        {badge.description && <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{badge.description}</p>}
        {earned && earnedAt && (
          <p className="mt-1.5 text-[10px] text-neutral-400">Earned {formatRelativeTime(earnedAt)}</p>
        )}
      </div>
    </div>
  );
}

export const BadgeCard = memo(BadgeCardComponent);
