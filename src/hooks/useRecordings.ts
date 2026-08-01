import { useState, useCallback } from 'react';
import { recordingService } from '@/services/live';
import type { LiveRecording, CreateRecordingInput, UpdateRecordingInput } from '@/services/live';

export function useRecordings(liveClassId?: string) {
  const [recordings, setRecordings] = useState<LiveRecording[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = useCallback(async (classId?: string) => {
    const targetId = classId ?? liveClassId;
    if (!targetId) return;
    setLoading(true);
    const { data, error: err } = await recordingService.getByLiveClass(targetId);
    if (err) setError(err);
    else { setRecordings(data); setError(null); }
    setLoading(false);
  }, [liveClassId]);

  const create = useCallback(async (input: CreateRecordingInput) => {
    const { data, error: err } = await recordingService.create(input);
    if (!err && data) setRecordings((prev) => [data, ...prev]);
    return { data, error: err };
  }, []);

  const update = useCallback(async (id: string, input: UpdateRecordingInput) => {
    const { data, error: err } = await recordingService.update(id, input);
    if (!err && data) setRecordings((prev) => prev.map((r) => (r.id === id ? data : r)));
    return { data, error: err };
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error: err } = await recordingService.delete(id);
    if (!err) setRecordings((prev) => prev.filter((r) => r.id !== id));
    return { error: err };
  }, []);

  return {
    recordings, loading, error,
    fetchRecordings, create, update, remove,
  };
}