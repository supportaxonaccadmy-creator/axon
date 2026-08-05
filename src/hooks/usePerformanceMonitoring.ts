import { useState, useCallback } from 'react';
import { performanceMonitoringService } from '@/services/monitoring';
import type { PerformanceMetric } from '@/services/monitoring';

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const refresh = useCallback(() => { setMetrics(performanceMonitoringService.getDefaultMetrics()); }, []);
  const performanceScore = performanceMonitoringService.getPerformanceScore();
  const allHealthy = metrics.length > 0 && metrics.every((m) => m.status === 'healthy');
  return { metrics, performanceScore, allHealthy, refresh };
}
