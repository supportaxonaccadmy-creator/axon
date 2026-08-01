import { memo, useMemo } from 'react';
import { Video, Clock, CheckCircle, XCircle, Radio } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';

import type { LiveClass } from '@/services/live';

interface LiveAnalyticsProps {
  liveClasses: LiveClass[];
  className?: string | undefined;
}

function LiveAnalyticsComponent({ liveClasses, className }: LiveAnalyticsProps) {
  const stats = useMemo(() => {
    const total = liveClasses.length;
    const live = liveClasses.filter((c) => c.status === 'live').length;
    const scheduled = liveClasses.filter((c) => c.status === 'scheduled').length;
    const completed = liveClasses.filter((c) => c.status === 'completed').length;
    const cancelled = liveClasses.filter((c) => c.status === 'cancelled').length;

    return [
      { label: 'Total Classes', value: total, icon: Video, color: 'text-blue-500', bg: 'bg-blue-50' },
      { label: 'Live Now', value: live, icon: Radio, color: 'text-red-500', bg: 'bg-red-50' },
      { label: 'Scheduled', value: scheduled, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
      { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
      { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'text-neutral-400', bg: 'bg-neutral-50' },
    ];
  }, [liveClasses]);

  return (
    <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-5', className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} hover>
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', stat.bg)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const LiveAnalytics = memo(LiveAnalyticsComponent);
