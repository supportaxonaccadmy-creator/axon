import { memo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Video, Clock, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import type { LiveAnalytics as LiveAnalyticsData, MeetingProviderType } from '@/services/live';
import { getSupabaseClient } from '@/lib/supabase';
import { PROVIDER_LABELS, formatDuration } from '@/services/live';

interface LiveAnalyticsProps {
  analytics?: LiveAnalyticsData;
  className?: string | undefined;
}

function LiveAnalyticsComponent({ analytics: propAnalytics, className }: LiveAnalyticsProps) {
  const [analytics, setAnalytics] = useState<LiveAnalyticsData | null>(propAnalytics ?? null);
  const [loading, setLoading] = useState(!propAnalytics);

  const fetchAnalytics = useCallback(async () => {
    if (propAnalytics) { setAnalytics(propAnalytics); return; }
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: classes } = await supabase.from('live_classes').select('status, provider_type, start_time, end_time');
      const { count: recordingsCount } = await supabase.from('live_recordings').select('*', { count: 'exact', head: true });
      const { count: participantsCount } = await supabase.from('live_attendance').select('*', { count: 'exact', head: true });

      const classRows = (classes ?? []) as Array<Record<string, unknown>>;
      const providerBreakdown = {} as Record<MeetingProviderType, number>;
      let totalDuration = 0;
      let durationCount = 0;

      for (const row of classRows) {
        const pt = row.provider_type as MeetingProviderType;
        if (pt) providerBreakdown[pt] = (providerBreakdown[pt] ?? 0) + 1;
        if (row.start_time && row.end_time) {
          const dur = (new Date(String(row.end_time)).getTime() - new Date(String(row.start_time)).getTime()) / 1000;
          if (dur > 0) { totalDuration += dur; durationCount++; }
        }
      }

      setAnalytics({
        totalClasses: classRows.length,
        scheduledClasses: classRows.filter((r) => r.status === 'scheduled').length,
        liveClasses: classRows.filter((r) => r.status === 'live').length,
        completedClasses: classRows.filter((r) => r.status === 'completed').length,
        cancelledClasses: classRows.filter((r) => r.status === 'cancelled').length,
        totalParticipants: participantsCount ?? 0,
        totalRecordings: recordingsCount ?? 0,
        averageDurationSeconds: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
        providerBreakdown,
      });
    } catch {
      // ignore
    }
    setLoading(false);
  }, [propAnalytics]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !analytics) {
    return (
      <Card className={cn(className)}>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-neutral-500">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: 'Total Classes', value: analytics.totalClasses, icon: Video, color: 'text-primary-600 bg-primary-50' },
    { label: 'Live now', value: analytics.liveClasses, icon: TrendingUp, color: 'text-error-600 bg-error-50' },
    { label: 'Completed', value: analytics.completedClasses, icon: Clock, color: 'text-success-600 bg-success-50' },
    { label: 'Cancelled', value: analytics.cancelledClasses, icon: XCircle, color: 'text-neutral-600 bg-neutral-100' },
    { label: 'Participants', value: analytics.totalParticipants, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Recordings', value: analytics.totalRecordings, icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Live Class Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg border border-neutral-100 p-3">
                <div className={cn('mb-2 inline-flex rounded-lg p-1.5', stat.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {analytics.averageDurationSeconds > 0 && (
          <div className="rounded-lg bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Average Duration</p>
            <p className="text-lg font-semibold text-neutral-900">{formatDuration(analytics.averageDurationSeconds)}</p>
          </div>
        )}

        {Object.keys(analytics.providerBreakdown).length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-neutral-500">By Provider</p>
            <div className="space-y-1.5">
              {(Object.entries(analytics.providerBreakdown) as Array<[MeetingProviderType, number]>).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">{PROVIDER_LABELS[type] ?? type}</span>
                  <span className="font-medium text-neutral-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const LiveAnalytics = memo(LiveAnalyticsComponent);