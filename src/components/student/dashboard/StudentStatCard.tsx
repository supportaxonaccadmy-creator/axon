import { memo } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StudentStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  trend?: 'up' | 'down' | 'neutral' | undefined;
  trendPercent?: number | undefined;
  description?: string | undefined;
}

const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
  primary: { bg: 'bg-primary-50', icon: 'text-primary-600', text: 'text-primary-700' },
  success: { bg: 'bg-success-50', icon: 'text-success-600', text: 'text-success-700' },
  warning: { bg: 'bg-warning-50', icon: 'text-warning-600', text: 'text-warning-700' },
  error: { bg: 'bg-error-50', icon: 'text-error-600', text: 'text-error-700' },
  accent: { bg: 'bg-accent-50', icon: 'text-accent-600', text: 'text-accent-700' },
};

function StudentStatCardComponent({ label, value, icon: Icon, color, trend, trendPercent, description }: StudentStatCardProps) {
  const colors = colorMap[color]!;
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colors.bg)}><Icon className={cn('h-5 w-5', colors.icon)} strokeWidth={2} /></div>
        {trendPercent !== undefined && trendPercent > 0 && (
          <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', trend === 'up' ? 'bg-success-50 text-success-700' : trend === 'down' ? 'bg-error-50 text-error-700' : 'bg-neutral-50 text-neutral-500')}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}{trendPercent}%
          </div>
        )}
      </div>
      <div><p className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</p><p className="mt-0.5 text-sm font-medium text-neutral-600">{label}</p>{description && <p className="mt-1 text-xs text-neutral-400">{description}</p>}</div>
    </div>
  );
}

export const StudentStatCard = memo(StudentStatCardComponent);
