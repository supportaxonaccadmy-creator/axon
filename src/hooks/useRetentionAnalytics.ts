import { useState, useEffect, useCallback } from 'react';
import { retentionService } from '@/services/analytics';
import type { RetentionMetric } from '@/services/analytics';

export function useRetentionAnalytics(studentId?: string, batchId?: string) {
  const [retention, setRetention] = useState<RetentionMetric | null>(null);
  const [batchRetention, setBatchRetention] = useState<RetentionMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (studentId) {
      const { data, error: err } = await retentionService.getByStudent(studentId);
      setRetention(data);
      setError(err);
    } else if (batchId) {
      const { data, error: err } = await retentionService.getByBatch(batchId);
      setBatchRetention(data);
      setError(err);
    }
    setLoading(false);
  }, [studentId, batchId]);

  useEffect(() => { load(); }, [load]);
  return { retention, batchRetention, loading, error, refresh: load };
}
