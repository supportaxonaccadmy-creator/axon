import { useState, useEffect, useCallback } from 'react';
import { batchAnalyticsService } from '@/services/analytics';
import type { BatchAnalyticsSummary } from '@/services/analytics';

export function useBatchAnalytics(batchId?: string) {
  const [summary, setSummary] = useState<BatchAnalyticsSummary | null>(null);
  const [allSummaries, setAllSummaries] = useState<BatchAnalyticsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    if (batchId) { const { data, error: err } = await batchAnalyticsService.getBatchSummary(batchId); setSummary(data); setError(err); }
    else { const { data, error: err } = await batchAnalyticsService.getAllBatchSummaries(); setAllSummaries(data); setError(err); }
    setLoading(false);
  }, [batchId]);
  useEffect(() => { load(); }, [load]);
  return { summary, allSummaries, loading, error, refresh: load };
}
