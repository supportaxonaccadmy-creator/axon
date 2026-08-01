import { useState, useEffect, useMemo } from 'react';
import { Video, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LiveAnalytics, UpcomingWidget } from '@/components/live';
import { liveClassService } from '@/services/live';
import { useNavigate } from 'react-router-dom';
import type { LiveClass, LiveClassStats } from '@/services/live';

export function LiveDashboardPage() {
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [stats, setStats] = useState<LiveClassStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await liveClassService.getAll({ limit: 20 });
      setLiveClasses(data);
      const { data: statsData } = await liveClassService.getStats();
      setStats(statsData);
      setLoading(false);
    };
    void fetch();
  }, []);

  const liveNow = useMemo(() => liveClasses.filter((c) => c.status === 'live'), [liveClasses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Live Classes Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage live classes, meetings, and recordings</p>
        </div>
        <Button onClick={() => navigate('/admin/live-classes/new')}>
          <Video className="h-4 w-4" /> Create Live Class
        </Button>
      </div>

      <LiveAnalytics liveClasses={liveClasses} />

      {liveNow.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-500" /> Live Now ({liveNow.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {liveNow.map((lc) => (
                <div key={lc.id} className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{lc.title}</p>
                    <p className="text-xs text-neutral-500">Started {new Date(lc.startTime).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="danger" onClick={() => navigate(`/admin/live-classes/${lc.id}`)}>Manage</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <UpcomingWidget
        liveClasses={liveClasses}
        loading={loading}
        onViewAll={() => navigate('/admin/live-classes')}
        onClassClick={(lc) => navigate(`/admin/live-classes/${lc.id}`)}
      />

      <Card>
        <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                <p className="text-xs text-neutral-500">Total Classes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                <p className="text-xs text-neutral-500">Scheduled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-neutral-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-400">{stats.cancelled}</p>
                <p className="text-xs text-neutral-500">Cancelled</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
