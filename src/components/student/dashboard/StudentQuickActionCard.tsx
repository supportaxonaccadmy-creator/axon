import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FileText, HelpCircle, TrendingUp, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StudentQuickAction } from '@/types/studentDashboard';

const ICON_MAP: Record<string, LucideIcon> = { PlayCircle, FileText, HelpCircle, TrendingUp };

interface StudentQuickActionCardProps { action: StudentQuickAction; }

function StudentQuickActionCardComponent({ action }: StudentQuickActionCardProps) {
  const Icon = ICON_MAP[action.icon] ?? PlayCircle;
  return (
    <Link to={action.href} className={cn('group flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md', action.variant === 'primary' ? 'border-primary-200 hover:border-primary-400 hover:bg-primary-50' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50')}>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors', action.variant === 'primary' ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200' : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200')}><Icon className="h-5 w-5" strokeWidth={2} /></div>
      <div className="min-w-0"><p className={cn('text-sm font-semibold truncate', action.variant === 'primary' ? 'text-primary-800' : 'text-neutral-800')}>{action.label}</p><p className="text-xs text-neutral-500 truncate">{action.description}</p></div>
    </Link>
  );
}

export const StudentQuickActionCard = memo(StudentQuickActionCardComponent);
