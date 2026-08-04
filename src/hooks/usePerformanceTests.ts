import { useState, useCallback } from 'react';
import { performanceTestingService } from '@/services/testing';
import type { PerformanceMetric } from '@/services/testing';

export function usePerformanceTests() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [lighthouseScores, setLighthouseScores] = useState<{ category: string; score: number; status: string }[]>([]);
  const [bundleAnalysis, setBundleAnalysis] = useState<{ chunk: string; size: string; gzipSize: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const runPerformanceTests = useCallback(() => {
    setLoading(true);
    setMetrics(performanceTestingService.getPerformanceMetrics());
    setLighthouseScores(performanceTestingService.getLighthouseScores());
    setBundleAnalysis(performanceTestingService.getBundleAnalysis());
    setLoading(false);
  }, []);

  const allPassed = metrics.length > 0 && metrics.every((m) => m.status === 'pass');
  const avgResponseTime = metrics.length > 0 ? metrics.filter((m) => m.unit === 'ms').reduce((sum, m) => sum + m.value, 0) / metrics.filter((m) => m.unit === 'ms').length : 0;

  return { metrics, lighthouseScores, bundleAnalysis, loading, allPassed, avgResponseTime, runPerformanceTests };
}
