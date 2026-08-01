import { memo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { CalendarEvent } from '@/services/live';
import { calendarService } from '@/services/live';
import { formatDateTime, isToday } from '@/services/live';
import { LiveStatusBadge } from './LiveStatusBadge';
import { MeetingProviderBadge } from './MeetingProviderBadge';

interface UpcomingWidgetProps {
  events?: CalendarEvent[];
  limit?: number;
  onEventClick?: (event: CalendarEvent) => void;
  onViewAll?: () => void;
  className?: string | undefined;
}

function UpcomingWidgetComponent({ events: propEvents, limit = 5, onEventClick, onViewAll, className }: UpcomingWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents ?? []);
  const [loading, setLoading] = useState(!propEvents);

  const fetchEvents = useCallback(async () => {
    if (propEvents) { setEvents(propEvents); return; }
    setLoading(true);
    const { data } = await calendarService.getUpcoming(limit);
    setEvents(data);
    setLoading(false);
  }, [propEvents, limit]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          <Calendar className="mr-2 inline h-4 w-4" />
          Upcoming Classes
        </CardTitle>
        {onViewAll && (
          <Button size="sm" variant="ghost" onClick={onViewAll}>
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6 text-sm text-neutral-500">Loading...</div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-sm text-neutral-500">No upcoming classes</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const today = isToday(event.startTime);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick?.(event)}
                  className="flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-neutral-50"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <span className="text-xs font-medium uppercase">
                      {new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3)}
                    </span>
                    <span className="text-sm font-bold">{new Date(event.startTime).getDate()}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-900 line-clamp-1">{event.title}</p>
                      {today && <LiveStatusBadge status="live" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(event.startTime, event.timezone)}
                    </div>
                    <MeetingProviderBadge providerType={event.providerType} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const UpcomingWidget = memo(UpcomingWidgetComponent);