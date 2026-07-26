import { memo } from 'react';
import { Activity, CheckCircle2, HelpCircle, BookOpen, Video, FileText, Award } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import type { RecentActivity } from '@/services/student/enhancedStudentDashboardService';

interface RecentActivityCardProps { activities: RecentActivity[] | null; }

const ACTIVITY_ICONS = {
  class_completed: { icon: CheckCircle2, color: 'text-success-600 bg-success-50' },
  mcq_attempted: { icon: HelpCircle, color: 'text-primary-600 bg-primary-50' },
  batch_enrolled: { icon: BookOpen, color: 'text-accent-600 bg-accent-50' },
  video_watched: { icon: Video, color: 'text-primary-600 bg-primary-50' },
  pdf_downloaded: { icon: FileText, color: 'text-accent-600 bg-accent-50' },
} as const;

function RecentActivityCardComponent({ activities }: RecentActivityCardProps) {
  const data = activities ?? [];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-neutral-500" /><h3 className="text-sm font-semibold text-neutral-800">Recent Activity</h3></div>
      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center"><Award className="h-6 w-6 text-neutral-300" /><p className="text-xs text-neutral-500">No recent activity yet</p><p className="text-[10px] text-neutral-400">Start learning to see your activity here</p></div>
      ) : (
        <div className="mt-3 space-y-1">
          {data.slice(0, 6).map((a) => { const info = ACTIVITY_ICONS[a.type] ?? ACTIVITY_ICONS.class_completed; const Icon = info.icon; return (
            <div key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-neutral-50"><div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', info.color)}><Icon className="h-3.5 w-3.5" strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm text-neutral-700">{a.title}</p><p className="truncate text-xs text-neutral-400">{a.description}</p></div><span className="shrink-0 text-[10px] text-neutral-400">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}</span></div>
          ); })}
        </div>
      )}
    </div>
  );
}

export const RecentActivityCard = memo(RecentActivityCardComponent);
