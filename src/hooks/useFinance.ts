import { useState, useCallback } from 'react';
import { financeService } from '@/services/finance';
import type { FinanceDashboard, PaymentLog } from '@/services/finance';

export function useFinance() {
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => { setLoading(true); const [dash, logData] = await Promise.all([financeService.getDashboard(), financeService.getPaymentLogs(50)]); setDashboard(dash); setLogs(logData); setLoading(false); }, []);
  return { dashboard, logs, loading, refresh };
}
