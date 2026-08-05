import { useState, useCallback } from 'react';
import { healthMonitoringService } from '@/services/monitoring';
import type { HealthCheck } from '@/services/monitoring';

export function useHealthMonitoring() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const runChecks = useCallback(async () => { setLoading(true); const results = await healthMonitoringService.runAllHealthChecks(); setChecks(results); setLoading(false); return results; }, []);
  const overallHealth = checks.length > 0 ? healthMonitoringService.getOverallHealth(checks) : { score: 0, status: 'unknown' as const };
  const monitoredComponents = healthMonitoringService.getMonitoredComponents();
  return { checks, overallHealth, monitoredComponents, loading, runChecks };
}
