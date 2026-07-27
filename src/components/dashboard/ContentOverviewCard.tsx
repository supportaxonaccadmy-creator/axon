import { memo } from 'react';
import { Layers, BookOpen, FolderOpen, Video, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardContentStat } from '@/types/adminDashboard';

const ICON_MAP: Record<string, typeof Layers> = { Layers, BookOpen, FolderOpen, Video, PlayCircle, FileText, HelpCircle };
const colorMap: Record<string, { bg: string; icon: string }> = {
  primary: { bg: 'bg-primary-50', icon: 'text-primary-600' }, success: { bg: 'bg-success-50', icon: 'text-success-600' },
  warning: { bg: 'bg-warning-50', icon: 'text-warning-600' }, error: { bg: 'bg-error-50', icon: 'text-error-600' }, accent: { bg: 'bg-accent-50', icon: 'text-accent-600' },
};

interface ContentOverviewCardProps { stats: DashboardContentStat[]; loading?: boolean; }

function ContentOverviewCardComponent({ stats, loading = false }: ContentOverviewCardProps) {
  if (loading) return <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Content Overview</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map((stat) => {
        const Icon = ICON_MAP[stat.icon] ?? Layers; const colors = colorMap[stat.color] ?? colorMap.primary!;
        return <div key={stat.id} className="flex flex-col gap-2 rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50"><div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colors.bg)}><Icon className={cn('h-4 w-4', colors.icon)} strokeWidth={2} /></div><div><p className="text-lg font-bold text-neutral-900">{stat.value}</p><p className="text-[10px] text-neutral-500">{stat.label}</p></div>{stat.published > 0 && <p className="text-[10px] text-success-600">{stat.published} published</p>}</div>;
      })}</div>
    </div>
  );
}

export const ContentOverviewCard = memo(ContentOverviewCardComponent);
