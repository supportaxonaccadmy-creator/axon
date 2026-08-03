import { useState, useEffect, useCallback } from 'react';
import { engagementService } from '@/services/analytics';
import type { EngagementMetric } from '@/services/analytics';

export function useEngagementAnalytics(studentId: string | undefined, days = 30) {
  const [metrics, setMetrics] = useState<EngagementMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await engagementService.getByStudent(studentId, days);
    setMetrics(data);
    setError(err);
    setLoading(false);
  }, [studentId, days]);

  useEffect(() => { load(); }, [load]);
  return { metrics, loading, error, refresh: load };
}
