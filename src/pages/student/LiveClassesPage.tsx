import { useState, useEffect, useMemo } from 'react';
import { Radio, Clock, Calendar, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LiveClassCard } from '@/components/live';
import { calendarService } from '@/services/live';
import { isLiveNow, isToday } from '@/services/live';
import type { CalendarEvent, LiveClass } from '@/services/live';

export function LiveClassesPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: upcoming } = await calendarService.getUpcoming(50);
      const { data: todays } = await calendarService.getTodays();
      setEvents([...todays, ...upcoming.filter((u) => !todays.some((t) => t.id === u.id))]);
      setLoading(false);
    };
    void fetch();
  }, []);

  const liveNow = useMemo(() => events.filter((e) => isLiveNow(e)), [events]);
  const todays = useMemo(() => events.filter((e) => isToday(e.startTime) && !isLiveNow(e)), [events]);
  const upcoming = useMemo(() => events.filter((e) => new Date(e.startTime) > new Date() && !isToday(e.startTime)).slice(0, 6), [events]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Live Classes</h1>
        <p className="mt-1 text-sm text-neutral-500">Join live classes and view upcoming sessions</p>
      </div>
      {liveNow.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Radio className="h-4 w-4 text-red-500" /> Live Now</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveNow.map((lc) => <LiveClassCard key={lc.id} liveClass={lc as unknown as LiveClass} onJoin={() => { if (lc.meetingUrl) window.open(lc.meetingUrl, '_blank'); }} />)}
            </div>
          </CardContent>
        </Card>
      )}
      {todays.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-orange-500" /> Today's Classes</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {todays.map((lc) => <LiveClassCard key={lc.id} liveClass={lc as unknown as LiveClass} onJoin={() => { if (lc.meetingUrl) window.open(lc.meetingUrl, '_blank'); }} />)}
            </div>
          </CardContent>
        </Card>
      )}
      {upcoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Upcoming Classes</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((lc) => <LiveClassCard key={lc.id} liveClass={lc as unknown as LiveClass} onJoin={() => { if (lc.meetingUrl) window.open(lc.meetingUrl, '_blank'); }} />)}
            </div>
          </CardContent>
        </Card>
      )}
      {loading && <div className="py-8 text-center text-sm text-neutral-500">Loading...</div>}
      {!loading && events.length === 0 && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Video className="h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No live classes scheduled</p></CardContent></Card>
      )}
    </div>
  );
}