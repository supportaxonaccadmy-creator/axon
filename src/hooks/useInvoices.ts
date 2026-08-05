import { useState, useCallback } from 'react';
import { invoiceService } from '@/services/finance';
import type { Invoice } from '@/services/finance';

export function useInvoices(profileId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => { setLoading(true); const data = await invoiceService.getInvoices(profileId, 50); setInvoices(data); setLoading(false); }, [profileId]);
  return { invoices, loading, refresh };
}
