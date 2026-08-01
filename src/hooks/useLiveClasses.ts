import { useState, useEffect, useCallback, useRef } from 'react';
import { liveClassService } from '@/services/live';
import type { LiveClass, CreateLiveClassInput, UpdateLiveClassInput, LiveClassFilter, LiveClassStatus } from '@/services/live';

export function useLiveClasses(initialFilter?: LiveClassFilter) {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LiveClassFilter | undefined>(initialFilter);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await liveClassService.getAll(filter);
    if (err) setError(err);
    else { setClasses(data); setError(null); }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    unsubscribeRef.current = liveClassService.subscribeToChanges(() => {
      void fetchClasses();
    });
    return () => {
      if (unsubscribeRef.current) { unsubscribeRef.current(); unsubscribeRef.current = null; }
    };
  }, [fetchClasses]);

  const create = useCallback(async (input: CreateLiveClassInput) => {
    const { data, error: err } = await liveClassService.create(input);
    if (!err && data) setClasses((prev) => [data, ...prev]);
    return { data, error: err };
  }, []);

  const update = useCallback(async (id: string, input: UpdateLiveClassInput) => {
    const { data, error: err } = await liveClassService.update(id, input);
    if (!err && data) setClasses((prev) => prev.map((c) => (c.id === id ? data : c)));
    return { data, error: err };
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error: err } = await liveClassService.delete(id);
    if (!err) setClasses((prev) => prev.filter((c) => c.id !== id));
    return { error: err };
  }, []);

  const duplicate = useCallback(async (id: string, newTitle?: string) => {
    const { data, error: err } = await liveClassService.duplicate(id, newTitle);
    if (!err && data) setClasses((prev) => [data, ...prev]);
    return { data, error: err };
  }, []);

  const updateStatus = useCallback(async (id: string, status: LiveClassStatus) => {
    const { data, error: err } = await liveClassService.updateStatus(id, status);
    if (!err && data) setClasses((prev) => prev.map((c) => (c.id === id ? data : c)));
    return { data, error: err };
  }, []);

  const setFilterValue = useCallback((newFilter: LiveClassFilter | undefined) => {
    setFilter(newFilter);
  }, []);

  const search = useCallback((query: string | null) => {
    setFilter((prev) => ({ ...prev, search: query }));
  }, []);

  const filterByStatus = useCallback((status: LiveClassStatus | null) => {
    setFilter((prev) => ({ ...prev, status }));
  }, []);

  return {
    classes, loading, error,
    create, update, remove, duplicate, updateStatus,
    filter, setFilter: setFilterValue, search, filterByStatus,
    refetch: fetchClasses,
  };
}