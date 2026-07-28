import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/services/storage';
import type { StorageAnalytics } from '@/services/storage';

export function useStorageAnalytics() {
  const [analytics, setAnalytics] = useState<StorageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await storageService.getStorageAnalytics();
    if (err) {
      setError(err);
    } else {
      setAnalytics(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}
