import { useState, useCallback } from 'react';
import { refundService } from '@/services/finance';
import type { Refund } from '@/services/finance';

export function useRefunds(profileId?: string) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => { setLoading(true); const data = await refundService.getRefunds(profileId, 50); setRefunds(data); setLoading(false); }, [profileId]);
  const createRefund = useCallback(async (params: Parameters<typeof refundService.createRefund>[0]) => { return refundService.createRefund(params); }, []);
  const processRefund = useCallback(async (id: string, processedBy: string, gatewayRefundId?: string) => { return refundService.processRefund(id, processedBy, gatewayRefundId); }, []);
  return { refunds, loading, refresh, createRefund, processRefund };
}
