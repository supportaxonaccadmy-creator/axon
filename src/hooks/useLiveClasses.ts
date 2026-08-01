import { useState, useEffect, useCallback, useRef } from 'react';
import { liveClassService } from '@/services/live';
import type { LiveClass, LiveClassFilter, LiveClassStatus } from '@/services/live';

export function useLiveClasses(isAdmin: boolean, studentId: string | null, initialFilter?: LiveClassFilter) {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LiveClassFilter>(initialFilter ?? {});
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    if (isAdmin) {
      const { data, error: err } = await liveClassService.getAll(filter);
      if (err) setError(err);
      else { setLiveClasses(data); setError(null); }
    } else if (studentId) {
      const { data, error: err } = await liveClassService.getForStudent(studentId, filter);
      if (err) setError(err);
      else { setLiveClasses(data); setError(null); }
    }
    setLoading(false);
  }, [isAdmin, studentId, filter]);

  useEffect(() => {
    void fetchClasses();
    unsubscribeRef.current = liveClassService.subscribeToLiveClasses(() => void fetchClasses());
    return () => { if (unsubscribeRef.current) { unsubscribeRef.current(); unsubscribeRef.current = null; } };
  }, [fetchClasses]);

  const createClass = useCallback(async (adminId: string, input: Parameters<typeof liveClassService.create>[1]) => {
    const { data, error: err } = await liveClassService.create(adminId, input);
    if (!err) void fetchClasses();
    return { data, error: err };
  }, [fetchClasses]);

  const updateClass = useCallback(async (id: string, input: Parameters<typeof liveClassService.update>[1]) => {
    const { data, error: err } = await liveClassService.update(id, input);
    if (!err) void fetchClasses();
    return { data, error: err };
  }, [fetchClasses]);

  const deleteClass = useCallback(async (id: string) => {
    const { error: err } = await liveClassService.delete(id);
    if (!err) void fetchClasses();
    return { error: err };
  }, [fetchClasses]);

  const duplicateClass = useCallback(async (id: string, adminId: string) => {
    const { data, error: err } = await liveClassService.duplicate(id, adminId);
    if (!err) void fetchClasses();
    return { data, error: err };
  }, [fetchClasses]);

  const updateStatus = useCallback(async (id: string, status: LiveClassStatus) => {
    const { error: err } = await liveClassService.updateStatus(id, status);
    if (!err) void fetchClasses();
    return { error: err };
  }, [fetchClasses]);

  const filterByStatus = useCallback((status: LiveClassStatus | null) => {
    setFilter((prev) => ({ ...prev, status }));
  }, []);

  const filterByBatch = useCallback((batchId: string | null) => {
    setFilter((prev) => ({ ...prev, batchId }));
  }, []);

  const searchClasses = useCallback((query: string | null) => {
    setFilter((prev) => ({ ...prev, search: query }));
  }, []);

  return {
    liveClasses, loading, error,
    createClass, updateClass, deleteClass, duplicateClass, updateStatus,
    filterByStatus, filterByBatch, searchClasses,
    refetch: fetchClasses,
  };
}
