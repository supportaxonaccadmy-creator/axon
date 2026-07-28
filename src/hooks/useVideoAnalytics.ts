import { useState, useCallback, useEffect } from 'react';
import { videoStreamingService } from '@/services/video';
import type { VideoAnalytics } from '@/services/video';

export function useVideoAnalytics() {
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await videoStreamingService.getVideoAnalytics();
    if (err) setError(err);
    else setAnalytics(data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAnalytics(); }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}
