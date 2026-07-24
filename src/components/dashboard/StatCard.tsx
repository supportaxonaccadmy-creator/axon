import {
  Users, GraduationCap, BookOpen, TrendingUp, IndianRupee, ClipboardList,
  ArrowUpRight, ArrowDownRight, Minus, LucideIcon,
} from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/utils/cn';
import type { DashboardStat } from '@/types/dashboard';

const ICON_MAP: Record<string, LucideIcon> = {
  Users, GraduationCap, BookOpen, TrendingUp, IndianRupee, ClipboardList,
};

const colorMap: Record<DashboardStat['color'], { bg: string; icon: string; text: string; trend: string }> = {
  primary: { bg: 'bg-primary-50', icon: 'text-primary-600', text: 'text-primary-700', trend: 'text-primary-600' },
  success: { bg: 'bg-success-50', icon: 'text-success-600', text: 'text-success-700', trend: 'text-success-600' },
  warning: { bg: 'bg-warning-50', icon: 'text-warning-600', text: 'text-warning-700', trend: 'text-warning-600' },
  error: { bg: 'bg-error-50', icon: 'text-error-600', text: 'text-error-700', trend: 'text-error-600' },
  accent: { bg: 'bg-accent-50', icon: 'text-accent-600', text: 'text-accent-700', trend: 'text-accent-600' },
};

interface StatCardProps {
  stat: DashboardStat;
}

function StatCardComponent({ stat }: StatCardProps) {
  const Icon = ICON_MAP[stat.icon] ?? Users;
  const colors = colorMap[stat.color];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colors.bg)}>
          <Icon className={cn('h-5 w-5', colors.icon)} strokeWidth={2} />
        </div>
        {stat.trendPercent !== undefined && stat.trendPercent > 0 && (
          <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            stat.trend === 'up' ? 'bg-success-50 text-success-700' :
            stat.trend === 'down' ? 'bg-error-50 text-error-700' :
            'bg-neutral-50 text-neutral-500'
          )}>
            {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
             stat.trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {stat.trendPercent}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 tracking-tight">{stat.value}</p>
        <p className="mt-0.5 text-sm font-medium text-neutral-600">{stat.label}</p>
        {stat.description && (
          <p className="mt-1 text-xs text-neutral-400">{stat.description}</p>
        )}
      </div>
    </div>
  );
}

export const StatCard = memo(StatCardComponent);
