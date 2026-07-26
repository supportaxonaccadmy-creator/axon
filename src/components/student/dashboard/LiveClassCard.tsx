import { memo } from 'react';
import { Radio, Clock, Video } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { StudentLiveClass } from '@/types/studentDashboard';

interface LiveClassCardProps { liveClass: StudentLiveClass; }

function LiveClassCardComponent({ liveClass }: LiveClassCardProps) {
  const isLive = liveClass.status === 'live';
  const isUpcoming = liveClass.status === 'upcoming';
  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md', isLive ? 'border-error-200' : 'border-neutral-200')}>
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', isLive ? 'bg-error-50 text-error-600' : 'bg-primary-50 text-primary-600')}><Radio className={cn('h-5 w-5', isLive && 'animate-pulse')} strokeWidth={2} /></div>
        {isLive && <Badge variant="error">LIVE NOW</Badge>}
        {isUpcoming && <Badge variant="primary">Upcoming</Badge>}
      </div>
      <div><p className="text-sm font-semibold text-neutral-800">{liveClass.title}</p><p className="text-xs text-neutral-500">{liveClass.batchTitle}</p></div>
      <div className="flex items-center gap-3 text-xs text-neutral-400"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(liveClass.scheduledAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
      {liveClass.meetingUrl && <a href={liveClass.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"><Video className="h-4 w-4" />Join Class</a>}
    </div>
  );
}

export const LiveClassCard = memo(LiveClassCardComponent);
