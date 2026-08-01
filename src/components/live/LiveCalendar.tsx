import { memo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { CalendarEvent } from '@/services/live';
import { calendarService } from '@/services/live';
import { STATUS_VARIANT } from '@/services/live';

interface LiveCalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string | undefined;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function LiveCalendarComponent({ events: propEvents, onEventClick, className }: LiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents ?? []);

  useEffect(() => {
    if (propEvents) { setEvents(propEvents); return; }
    void (async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const { data } = await calendarService.getByDateRange(startDate, endDate);
      setEvents(data);
    })();
  }, [currentDate, propEvents]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const event of events) {
    const day = new Date(event.startTime).getDate();
    if (new Date(event.startTime).getMonth() === month && new Date(event.startTime).getFullYear() === year) {
      const existing = eventsByDay.get(day) ?? [];
      existing.push(event);
      eventsByDay.set(day, existing);
    }
  }

  const prevMonth = useCallback(() => setCurrentDate(new Date(year, month - 1, 1)), [year, month]);
  const nextMonth = useCallback(() => setCurrentDate(new Date(year, month + 1, 1)), [year, month]);

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
      <Calendar className="mr-2 inline h-4 w-4" />
      {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
    </CardTitle>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={nextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="pb-2 text-center text-xs font-medium text-neutral-400">{day}</div>
          ))}
          {cells.map((day, i) => (
            <div
              key={i}
              className={cn(
                'min-h-[60px] rounded-lg border border-neutral-100 p-1',
                day === null && 'bg-neutral-50',
                day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() && 'border-primary-300 bg-primary-50',
              )}
            >
              {day && (
                <>
                  <span className="text-xs font-medium text-neutral-600">{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {(eventsByDay.get(day) ?? []).slice(0, 2).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onEventClick?.(event)}
                        className="block w-full truncate rounded px-1 py-0.5 text-left text-xs text-white"
                        style={{ backgroundColor: STATUS_VARIANT[event.status] === 'error' ? '#dc2626' : STATUS_VARIANT[event.status] === 'success' ? '#16a34a' : STATUS_VARIANT[event.status] === 'info' ? '#2563eb' : '#737373' }}
                        title={event.title}
                      >
                        {event.title}
                      </button>
                    ))}
                    {(eventsByDay.get(day) ?? []).length > 2 && (
                      <span className="text-xs text-neutral-400">+{(eventsByDay.get(day) ?? []).length - 2} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const LiveCalendar = memo(LiveCalendarComponent);