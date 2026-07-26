import { memo } from 'react';
import { Calendar, HelpCircle, PlayCircle, FileText, Video, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { UpcomingTask } from '@/services/student/enhancedStudentDashboardService';

interface UpcomingTasksCardProps { tasks: UpcomingTask[] | null; }

const TYPE_ICONS = {
  mcq: { icon: HelpCircle, color: 'text-success-600 bg-success-50' },
  video: { icon: Video, color: 'text-primary-600 bg-primary-50' },
  pdf: { icon: FileText, color: 'text-accent-600 bg-accent-50' },
  live_class: { icon: PlayCircle, color: 'text-error-600 bg-error-50' },
} as const;

const PRIORITY_COLORS: Record<string, string> = { high: 'border-l-error-400', medium: 'border-l-warning-400', low: 'border-l-primary-300' };

function UpcomingTasksCardComponent({ tasks }: UpcomingTasksCardProps) {
  const data = tasks ?? [];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-neutral-500" /><h3 className="text-sm font-semibold text-neutral-800">Upcoming Tasks</h3></div>
      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center"><CheckCircle className="h-6 w-6 text-neutral-300" /><p className="text-xs text-neutral-500">No upcoming tasks</p></div>
      ) : (
        <div className="mt-3 space-y-2">
          {data.map((task) => { const typeInfo = TYPE_ICONS[task.type] ?? TYPE_ICONS.video; const Icon = typeInfo.icon; return (
            <div key={task.id} className={cn('flex items-center gap-3 rounded-lg border border-neutral-100 border-l-2 p-3 transition-colors hover:bg-neutral-50', PRIORITY_COLORS[task.priority])}>
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', typeInfo.color)}><Icon className="h-4 w-4" strokeWidth={2} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-800">{task.title}</p><p className="truncate text-xs text-neutral-500">{task.batchTitle}</p></div>
              <span className="shrink-0 text-xs text-neutral-400">{new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}

export const UpcomingTasksCard = memo(UpcomingTasksCardComponent);
