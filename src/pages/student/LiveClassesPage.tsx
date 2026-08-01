import { useState, useEffect, useMemo } from 'react';
import { Radio, Clock, Calendar, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LiveClassCard } from '@/components/live';
import { calendarService } from '@/services/live';
import { useCurrentUser } from '@/hooks/useProfile';
import { isLiveNow, isToday } from '@/services/live';
import type { LiveClass } from '@/services/live';

export function LiveClassesPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await calendarService.getUpcoming(false, studentId, 50);
      const { data: allData } = await calendarService.getTodays(false, studentId);
      setLiveClasses([...allData, ...data.filter((d) => !allData.some((a) => a.id === d.id))]);
      setLoading(false);
    };
    void fetch();
  }, [studentId]);

  const liveNow = useMemo(() => liveClasses.filter((c) => isLiveNow(c.startTime, c.endTime, c.status)), [liveClasses]);
  const todays = useMemo(() => liveClasses.filter((c) => isToday(c.startTime) && !isLiveNow(c.startTime, c.endTime, c.status)), [liveClasses]);
  const upcoming = useMemo(() => liveClasses.filter((c) => new Date(c.startTime) > new Date() && !isToday(c.startTime)).slice(0, 6), [liveClasses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Live Classes</h1>
        <p className="mt-1 text-sm text-neutral-500">Join live classes and view upcoming sessions</p>
      </div>

      {liveNow.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-500" /> Live Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveNow.map((lc) => (
                <LiveClassCard key={lc.id} liveClass={lc} onJoin={() => window.open(lc.meetingUrl, '_blank')} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {todays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" /> Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {todays.map((lc) => (
                <LiveClassCard key={lc.id} liveClass={lc} onJoin={() => window.open(lc.meetingUrl, '_blank')} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" /> Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((lc) => (
                <LiveClassCard key={lc.id} liveClass={lc} onJoin={() => window.open(lc.meetingUrl, '_blank')} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <div className="py-8 text-center text-sm text-neutral-500">Loading...</div>}

      {!loading && liveClasses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Video className="h-10 w-10 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">No live classes scheduled</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
