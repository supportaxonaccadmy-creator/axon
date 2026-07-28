import { useState, useCallback } from 'react';
import { storageService } from '@/services/storage';
import type { CleanupResult } from '@/services/storage';

export function useStorageCleanup() {
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCleanup = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await storageService.cleanupUnusedFiles();
    setCleanupResult(result);
    if (result.error) setError(result.error);
    setLoading(false);
    return result;
  }, []);

  return { cleanupResult, loading, error, runCleanup };
}
