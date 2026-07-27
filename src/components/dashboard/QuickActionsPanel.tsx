import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, BookOpen, FolderOpen, Video, PlayCircle, FileText, HelpCircle, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardQuickAction } from '@/types/dashboard';

const ICON_MAP: Record<string, typeof Layers> = { Layers, BookOpen, FolderOpen, Video, PlayCircle, FileText, HelpCircle, Users };

interface QuickActionsPanelProps { actions: DashboardQuickAction[]; loading?: boolean; }

function QuickActionsPanelComponent({ actions, loading = false }: QuickActionsPanelProps) {
  if (loading) return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />)}</div>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{actions.map((action) => {
      const Icon = ICON_MAP[action.icon] ?? Layers;
      return (
        <Link key={action.id} to={action.href} className={cn('group flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md', action.variant === 'primary' ? 'border-primary-200 bg-primary-50/50 hover:border-primary-300' : 'border-neutral-200 hover:border-primary-200')}>
          <div className="flex items-center justify-between"><div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', action.variant === 'primary' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600')}><Icon className="h-4 w-4" strokeWidth={2} /></div><ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-primary-500 transition-colors" /></div>
          <div><p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">{action.label}</p><p className="text-[10px] text-neutral-500 leading-tight">{action.description}</p></div>
        </Link>
      );
    })}</div>
  );
}

export const QuickActionsPanel = memo(QuickActionsPanelComponent);
