import { useState, useEffect, useCallback } from 'react';
import { videoStreamingService } from '@/services/video';
import type { ContinueWatchingItem } from '@/services/video';

export function useContinueWatching(studentId: string | null, limit: number = 10) {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await videoStreamingService.getContinueWatching(studentId, limit);
    if (err) setError(err);
    else { setItems(data); setError(null); }
    setLoading(false);
  }, [studentId, limit]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { items, loading, error, refetch: fetch };
}
