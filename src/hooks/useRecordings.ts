import { useState, useEffect, useCallback } from 'react';
import { recordingService } from '@/services/live';
import type { LiveRecording } from '@/services/live';

export function useRecordings(isAdmin: boolean, studentId: string | null, batchId?: string | null) {
  const [recordings, setRecordings] = useState<LiveRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    if (isAdmin) {
      const { data, error: err } = await recordingService.getAll();
      if (err) setError(err);
      else { setRecordings(data); setError(null); }
    } else if (studentId) {
      const { data, error: err } = await recordingService.getForStudent(studentId);
      if (err) setError(err);
      else { setRecordings(data); setError(null); }
    } else if (batchId) {
      const { data, error: err } = await recordingService.getByBatch(batchId);
      if (err) setError(err);
      else { setRecordings(data); setError(null); }
    }
    setLoading(false);
  }, [isAdmin, studentId, batchId]);

  useEffect(() => { void fetchRecordings(); }, [fetchRecordings]);

  const createRecording = useCallback(async (adminId: string, input: Parameters<typeof recordingService.create>[1]) => {
    const { data, error: err } = await recordingService.create(adminId, input);
    if (!err) void fetchRecordings();
    return { data, error: err };
  }, [fetchRecordings]);

  const updateRecording = useCallback(async (id: string, input: Parameters<typeof recordingService.update>[1]) => {
    const { data, error: err } = await recordingService.update(id, input);
    if (!err) void fetchRecordings();
    return { data, error: err };
  }, [fetchRecordings]);

  const deleteRecording = useCallback(async (id: string) => {
    const { error: err } = await recordingService.delete(id);
    if (!err) void fetchRecordings();
    return { error: err };
  }, [fetchRecordings]);

  return {
    recordings, loading, error,
    createRecording, updateRecording, deleteRecording,
    refetch: fetchRecordings,
  };
}
