import { Eye, Clock, TrendingUp, Award, Film } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics';
import { formatWatchTime } from '@/services/video';

export function VideoAnalyticsPage() {
  const { analytics, loading, error } = useVideoAnalytics();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-28 animate-pulse bg-neutral-100">&nbsp;</Card>
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="p-4">
        <p className="text-sm text-error-600">{error ?? 'Failed to load analytics'}</p>
      </Card>
    );
  }

  const stats = [
    { label: 'Total Videos', value: String(analytics.totalVideos), icon: Film, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Views', value: String(analytics.totalViews), icon: Eye, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Watch Time', value: formatWatchTime(analytics.totalWatchTimeSeconds), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Avg Completion', value: `${analytics.averageCompletionRate}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Video Analytics</h1>
        <p className="mt-1 text-sm text-neutral-500">Track video performance and student engagement</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Watched Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.mostWatched.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">No watch data available yet</p>
          ) : (
            <div className="space-y-2">
              {analytics.mostWatched.map((item, idx) => (
                <div key={item.videoId} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600">{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{item.title || 'Untitled'}</p>
                    <p className="text-xs text-neutral-500">{item.views} views · {item.averageCompletion}% avg completion</p>
                  </div>
                  <Award className="h-4 w-4 text-neutral-300" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Published vs Draft</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-success-600">{analytics.publishedVideos}</span>
                <span className="text-xs text-neutral-500">Published</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-neutral-400">{analytics.draftVideos}</span>
                <span className="text-xs text-neutral-500">Draft</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary-600">{analytics.totalVideos}</span>
                <span className="text-xs text-neutral-500">Total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Engagement Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Total Watch Time</span><span className="font-medium text-neutral-900">{formatWatchTime(analytics.totalWatchTimeSeconds)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Average Completion</span><span className="font-medium text-neutral-900">{analytics.averageCompletionRate}%</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Total Views</span><span className="font-medium text-neutral-900">{analytics.totalViews}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
