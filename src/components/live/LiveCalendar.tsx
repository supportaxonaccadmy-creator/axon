import { memo, useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { LiveStatusBadge } from './LiveStatusBadge';
import { STATUS_COLORS } from '@/services/live';
import type { CalendarEvent } from '@/services/live';

interface LiveCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string | undefined;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function LiveCalendarComponent({ events, onEventClick, className }: LiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');
  void view;

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const dateKey = new Date(event.start).toDateString();
      const existing = map.get(dateKey) ?? [];
      existing.push(event);
      map.set(dateKey, existing);
    }
    return map;
  }, [events]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days: Array<Date | null> = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(new Date(year, month, d));
    return days;
  }, [currentDate]);

  const prevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const today = new Date().toDateString();

  if (view === 'agenda') {
    const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return (
      <div className={className}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">Agenda</h3>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setView('month')}>Month</Button>
            <Button size="sm" variant="outline" onClick={() => setView('week')}>Week</Button>
            <Button size="sm" variant="primary" onClick={() => setView('agenda')}>Agenda</Button>
          </div>
        </div>
        <div className="space-y-2">
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">No upcoming events</p>
          ) : (
            sorted.map((event) => (
              <button
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="flex w-full items-center gap-3 rounded-lg border border-neutral-100 p-3 text-left transition-colors hover:bg-neutral-50"
              >
                <div className={cn('h-10 w-1 rounded-full', STATUS_COLORS[event.status])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900">{event.title}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(event.start).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <LiveStatusBadge status={event.status} />
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-sm font-semibold text-neutral-900 min-w-32 text-center">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={nextMonth} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Next month">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant={view === 'month' ? 'primary' : 'outline'} onClick={() => setView('month')}>Month</Button>
          <Button size="sm" variant={view === 'week' ? 'primary' : 'outline'} onClick={() => setView('week')}>Week</Button>
          <Button size="sm" variant="outline" onClick={() => setView('agenda')}>Agenda</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-400 pb-2">{day}</div>
        ))}
        {daysInMonth.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const dateKey = date.toDateString();
          const dayEvents = eventsByDay.get(dateKey) ?? [];
          const isToday = dateKey === today;
          return (
            <div
              key={date.toISOString()}
              className={cn(
                'min-h-16 rounded-lg border p-1.5 text-xs',
                isToday ? 'border-primary-300 bg-primary-50' : 'border-neutral-100',
              )}
            >
              <div className={cn('mb-1 font-medium', isToday ? 'text-primary-700' : 'text-neutral-600')}>{date.getDate()}</div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className={cn(
                      'block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium',
                      STATUS_COLORS[event.status],
                    )}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-neutral-400">+{dayEvents.length - 2} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const LiveCalendar = memo(LiveCalendarComponent);
