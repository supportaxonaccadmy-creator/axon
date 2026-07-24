import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  UserPlus, BookMarked, CheckCircle, FileText, Award, Zap, LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardActivity, DashboardActivityType } from '@/types/dashboard';

const TYPE_CONFIG: Record<DashboardActivityType, { icon: LucideIcon; color: string; bg: string }> = {
  user_registered:       { icon: UserPlus,    color: 'text-primary-600',  bg: 'bg-primary-50' },
  course_enrolled:       { icon: BookMarked,  color: 'text-accent-600',   bg: 'bg-accent-50' },
  course_completed:      { icon: CheckCircle, color: 'text-success-600',  bg: 'bg-success-50' },
  assessment_submitted:  { icon: FileText,    color: 'text-warning-600',  bg: 'bg-warning-50' },
  certificate_issued:    { icon: Award,       color: 'text-success-600',  bg: 'bg-success-50' },
  system_event:          { icon: Zap,         color: 'text-neutral-500',  bg: 'bg-neutral-100' },
};

interface ActivityCardProps {
  activities: DashboardActivity[];
  loading?: boolean | undefined;
}

function ActivityCardComponent({ activities, loading }: ActivityCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-neutral-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-neutral-100" />
                <div className="h-2.5 w-1/2 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-neutral-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="divide-y divide-neutral-50">
        {activities.map((activity) => {
          const config = TYPE_CONFIG[activity.type];
          const Icon = config.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-neutral-50/50">
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-800 truncate">{activity.actorName}</p>
                <p className="text-xs text-neutral-500 truncate">{activity.description}</p>
              </div>
              <time className="shrink-0 text-xs text-neutral-400 tabular-nums">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </time>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ActivityCard = memo(ActivityCardComponent);
