import { useState, useEffect, useCallback } from 'react';
import { videoStreamingService } from '@/services/video';
import type { VideoWatchHistoryEntry } from '@/services/video';

export function useWatchHistory(studentId: string | null, limit: number = 20) {
  const [history, setHistory] = useState<VideoWatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await videoStreamingService.getWatchHistory(studentId, limit);
    if (err) setError(err);
    else { setHistory(data); setError(null); }
    setLoading(false);
  }, [studentId, limit]);

  useEffect(() => { void fetchHistory(); }, [fetchHistory]);

  const recordSession = useCallback(async (videoId: string, sessionDuration: number) => {
    if (!studentId) return;
    await videoStreamingService.recordWatchSession(studentId, { videoId, sessionDuration });
    void fetchHistory();
  }, [studentId, fetchHistory]);

  return { history, loading, error, recordSession, refetch: fetchHistory };
}
