import { memo } from 'react';
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StudentAnnouncement } from '@/types/studentDashboard';

const TYPE_CONFIG = {
  info: { icon: Info, bg: 'bg-primary-50', text: 'text-primary-700', iconColor: 'text-primary-600' },
  warning: { icon: AlertTriangle, bg: 'bg-warning-50', text: 'text-warning-700', iconColor: 'text-warning-600' },
  success: { icon: CheckCircle2, bg: 'bg-success-50', text: 'text-success-700', iconColor: 'text-success-600' },
} as const;

interface AnnouncementCardProps { announcement: StudentAnnouncement; }

function AnnouncementCardComponent({ announcement }: AnnouncementCardProps) {
  const config = TYPE_CONFIG[announcement.type];
  const Icon = config.icon;
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4', !announcement.read && 'ring-1 ring-primary-200')}>
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}><Icon className={cn('h-4 w-4', config.iconColor)} strokeWidth={2} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-neutral-800">{announcement.title}</p>{!announcement.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />}</div>
        <p className="mt-1 text-xs text-neutral-600 leading-relaxed">{announcement.message}</p>
        <p className="mt-1.5 text-xs text-neutral-400">{new Date(announcement.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>
    </div>
  );
}

export const AnnouncementCard = memo(AnnouncementCardComponent);
