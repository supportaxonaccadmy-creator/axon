import { memo } from 'react';
import {
  Users, GraduationCap, Layers, BookOpen, FolderOpen, Video, PlayCircle, FileText,
  HelpCircle, ShoppingCart, IndianRupee, LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardStat } from '@/types/dashboard';

const ICON_MAP: Record<string, LucideIcon> = {
  Users, GraduationCap, Layers, BookOpen, FolderOpen, Video, PlayCircle, FileText,
  HelpCircle, ShoppingCart, IndianRupee,
};

const colorMap: Record<DashboardStat['color'], { bg: string; icon: string }> = {
  primary: { bg: 'bg-primary-50', icon: 'text-primary-600' },
  success: { bg: 'bg-success-50', icon: 'text-success-600' },
  warning: { bg: 'bg-warning-50', icon: 'text-warning-600' },
  error: { bg: 'bg-error-50', icon: 'text-error-600' },
  accent: { bg: 'bg-accent-50', icon: 'text-accent-600' },
};

interface AnalyticsCardProps { stat: DashboardStat; }

function AnalyticsCardComponent({ stat }: AnalyticsCardProps) {
  const Icon = ICON_MAP[stat.icon] ?? Users;
  const colors = colorMap[stat.color] ?? colorMap.primary!;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:border-neutral-300">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', colors.bg)}><Icon className={cn('h-4 w-4', colors.icon)} strokeWidth={2} /></div>
      <div><p className="text-xl font-bold text-neutral-900 tracking-tight">{stat.value}</p><p className="text-xs font-medium text-neutral-600">{stat.label}</p>{stat.description && <p className="mt-0.5 text-[10px] text-neutral-400">{stat.description}</p>}</div>
    </div>
  );
}

export const AnalyticsCard = memo(AnalyticsCardComponent);
