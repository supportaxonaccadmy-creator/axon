import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
}

const colorMap = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  error: 'bg-error-50 text-error-700',
  accent: 'bg-accent-50 text-accent-700',
};

function AnalyticsCardComponent({
  title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary',
}: AnalyticsCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorMap[color])}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
        {trend && trendValue && (
          <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            trend === 'up' ? 'bg-success-50 text-success-700' :
            trend === 'down' ? 'bg-error-50 text-error-700' :
            'bg-neutral-50 text-neutral-500')}>
            <TrendIcon className="h-3 w-3" />{trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-neutral-900">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-neutral-600">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export const AnalyticsCard = memo(AnalyticsCardComponent);
