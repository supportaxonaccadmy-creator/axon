import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LiveClassCard, LiveCalendar } from '@/components/live';
import { calendarService } from '@/services/live';
import { useCurrentUser } from '@/hooks/useProfile';
import { isLiveNow } from '@/services/live';
import type { LiveClass, CalendarEvent } from '@/services/live';

export function UpcomingLivePage() {
  const profile = useCurrentUser();
  void profile;
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: eventData } = await calendarService.getEvents();
      setEvents(eventData);
      const { data: upcoming } = await calendarService.getUpcoming(20);
      setLiveClasses(upcoming.map((e) => ({
        id: e.id, title: e.title, description: null, providerType: e.providerType,
        meetingUrl: '', meetingPassword: null, meetingId: null, hostId: null,
        batchId: e.batchId, subjectId: null, chapterId: null, classId: null,
        thumbnailUrl: null, bannerUrl: null, startTime: e.startTime, endTime: e.endTime,
        timezone: 'UTC', status: e.status, recurring: 'none' as const,
        recurringInterval: null, recurringEndDate: null, waitingRoom: false,
        maxParticipants: null, allowRecording: true, autoRecording: false,
        hostControls: {}, createdBy: null, createdAt: e.startTime, updatedAt: e.startTime,
      })));
      setLoading(false);
    };
    void fetch();
  }, []);

  const liveNow = useMemo(() => liveClasses.filter((c) => isLiveNow(c)), [liveClasses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Upcoming Live Classes</h1>
        <p className="mt-1 text-sm text-neutral-500">Calendar view of all your scheduled live classes</p>
      </div>
      {liveNow.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Radio className="h-4 w-4 text-red-500" /> Live Now ({liveNow.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveNow.map((lc) => <LiveClassCard key={lc.id} liveClass={lc} onJoin={() => { if (lc.meetingUrl) window.open(lc.meetingUrl, '_blank'); }} />)}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary-500" /> Calendar</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="py-8 text-center text-sm text-neutral-500">Loading calendar...</div> : <LiveCalendar events={events} onEventClick={() => window.open('/student/live-classes', '_self')} />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> Upcoming</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="py-8 text-center text-sm text-neutral-500">Loading...</div> : liveClasses.length === 0 ? <div className="py-8 text-center text-sm text-neutral-500">No upcoming classes</div> : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveClasses.map((lc) => <LiveClassCard key={lc.id} liveClass={lc} onJoin={() => { if (lc.meetingUrl) window.open(lc.meetingUrl, '_blank'); }} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}