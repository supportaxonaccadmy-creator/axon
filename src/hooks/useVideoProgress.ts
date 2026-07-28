import { useState, useCallback, useRef, useEffect } from 'react';
import { videoStreamingService, PROGRESS_SAVE_INTERVAL_MS, calculateCompletionPercentage, isVideoCompleted } from '@/services/video';
import type { VideoProgress } from '@/services/video';

export function useVideoProgress(studentId: string | null, videoId: string | null, videoDuration: number) {
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const watchedSecondsRef = useRef(0);
  const lastPositionRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!studentId || !videoId) { setLoading(false); return; }
    setLoading(true);
    void videoStreamingService.getProgress(studentId, videoId).then(({ data }) => {
      setProgress(data);
      if (data) {
        watchedSecondsRef.current = data.watchedSeconds;
        lastPositionRef.current = data.lastPositionSeconds;
      }
      setLoading(false);
    });
  }, [studentId, videoId]);

  const saveProgress = useCallback(async () => {
    if (!studentId || !videoId) return;
    const watched = watchedSecondsRef.current;
    const position = lastPositionRef.current;
    const pct = videoDuration > 0 ? calculateCompletionPercentage(watched, videoDuration) : 0;
    const completed = isVideoCompleted(pct);

    const { data } = await videoStreamingService.saveProgress(studentId, {
      videoId, watchedSeconds: watched, lastPositionSeconds: position,
      completedPercentage: pct, isCompleted: completed,
    });
    if (data) setProgress(data);
  }, [studentId, videoId, videoDuration]);

  const updatePosition = useCallback((position: number) => {
    lastPositionRef.current = position;
  }, []);

  const addWatchedSeconds = useCallback((seconds: number) => {
    watchedSecondsRef.current += seconds;
  }, []);

  const startAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    saveTimerRef.current = setInterval(() => { void saveProgress(); }, PROGRESS_SAVE_INTERVAL_MS);
  }, [saveProgress]);

  const stopAutoSave = useCallback(() => {
    if (saveTimerRef.current) { clearInterval(saveTimerRef.current); saveTimerRef.current = null; }
    void saveProgress();
  }, [saveProgress]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      void saveProgress();
    };
  }, [saveProgress]);

  return {
    progress, loading,
    updatePosition, addWatchedSeconds,
    startAutoSave, stopAutoSave, saveProgress,
    watchedSeconds: watchedSecondsRef.current,
    lastPosition: lastPositionRef.current,
    completionPercentage: progress?.completedPercentage ?? 0,
    isCompleted: progress?.isCompleted ?? false,
  };
}
