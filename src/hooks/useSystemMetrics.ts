import { useState, useCallback } from 'react';
import { systemMetricsService } from '@/services/monitoring';
import type { SystemMetric } from '@/services/monitoring';

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const refresh = useCallback(() => { setMetrics(systemMetricsService.getDefaultMetrics()); }, []);
  const categories = systemMetricsService.getMetricCategories();
  return { metrics, categories, refresh };
}
