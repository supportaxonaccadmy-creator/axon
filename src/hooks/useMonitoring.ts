import { useState, useCallback } from 'react';
import { analyticsMonitoringService, alertService, loggingService } from '@/services/monitoring';
import type { MonitoringSummary, Alert } from '@/services/monitoring';

export function useMonitoring() {
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(() => { setLoading(true); setSummary(analyticsMonitoringService.getMonitoringSummary()); setActiveAlerts(alertService.getActiveAlerts()); setLoading(false); }, []);
  const acknowledgeAlert = useCallback((id: string) => { alertService.acknowledgeAlert(id); setActiveAlerts(alertService.getActiveAlerts()); }, []);
  const resolveAlert = useCallback((id: string) => { alertService.resolveAlert(id); setActiveAlerts(alertService.getActiveAlerts()); }, []);
  const totalLogs = loggingService.getTotalLogs();
  return { summary, activeAlerts, totalLogs, loading, refresh, acknowledgeAlert, resolveAlert };
}
