import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface VideoAnalyticsData {
  totalVideos: number;
  totalViews: number;
  averageCompletionRate: number;
  totalWatchTimeMinutes: number;
  topVideos: Array<{ videoId: string; title: string; views: number; completionRate: number }>;
  watchTimeByDay: Array<{ date: string; minutes: number }>;
}

export const videoAnalyticsService = {
  async getOverview(): Promise<{ data: VideoAnalyticsData | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const [{ data: videos }, { data: progress }] = await Promise.all([
        supabase.from('videos').select('id, title, status'),
        supabase.from('video_progress').select('video_id, student_id, watch_percentage, is_completed, created_at'),
      ]);

      const videoRows = videos ?? [];
      const progressRows = progress ?? [];
      const totalViews = progressRows.length;
      const completedCount = progressRows.filter((p) => p.is_completed).length;
      const averageCompletionRate = totalViews > 0 ? (completedCount / totalViews) * 100 : 0;

      const watchTimeByDayMap = new Map<string, number>();
      for (const p of progressRows) {
        const date = (p.created_at as string).split('T')[0] ?? '';
        watchTimeByDayMap.set(date, (watchTimeByDayMap.get(date) ?? 0) + 30);
      }

      const videoViewMap = new Map<string, number>();
      const videoCompletionMap = new Map<string, number[]>();
      for (const p of progressRows) {
        const vid = p.video_id as string;
        videoViewMap.set(vid, (videoViewMap.get(vid) ?? 0) + 1);
        if (!videoCompletionMap.has(vid)) videoCompletionMap.set(vid, []);
        videoCompletionMap.get(vid)!.push(p.watch_percentage ?? 0);
      }

      const topVideos = videoRows
        .map((v) => {
          const views = videoViewMap.get(v.id as string) ?? 0;
          const completions = videoCompletionMap.get(v.id as string) ?? [];
          const avgCompletion = completions.length > 0 ? completions.reduce((a, b) => a + b, 0) / completions.length : 0;
          return { videoId: v.id as string, title: v.title as string, views, completionRate: avgCompletion };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      return {
        data: {
          totalVideos: videoRows.length,
          totalViews,
          averageCompletionRate,
          totalWatchTimeMinutes: totalViews * 30,
          topVideos,
          watchTimeByDay: Array.from(watchTimeByDayMap.entries())
            .map(([date, minutes]) => ({ date, minutes }))
            .sort((a, b) => a.date.localeCompare(b.date)),
        },
        error: null,
      };
    } catch (err) {
      logger.error('videoAnalyticsService.getOverview', { error: err instanceof Error ? err.message : 'Unknown' });
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
