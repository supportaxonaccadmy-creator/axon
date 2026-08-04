import { useState, useCallback } from 'react';
import { healthCheckService } from '@/services/devops';
import type { HealthCheckResult, HealthStatus } from '@/services/devops';

export function useHealthChecks() {
  const [checks, setChecks] = useState<HealthCheckResult[]>([]);
  const [overallHealth, setOverallHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const runChecks = useCallback(async () => { setLoading(true); const results = await healthCheckService.runAllHealthChecks(); setChecks(results); const overall = await healthCheckService.getOverallHealth(); setOverallHealth(overall); setLoading(false); }, []);
  const checkDatabase = useCallback(async () => { const result = await healthCheckService.checkDatabase(); setChecks((prev) => { const filtered = prev.filter((c) => c.component !== 'database'); return [...filtered, result]; }); return result; }, []);
  return { checks, overallHealth, loading, runChecks, checkDatabase };
}
