import { useState, useCallback } from 'react';
import { marketingService } from '@/services/seo';

export function useMarketing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const subscribeNewsletter = useCallback(async (email: string, source?: string) => { setLoading(true); setError(null); setSuccess(false); const result = await marketingService.subscribeNewsletter(email, source); setLoading(false); if (result.success) setSuccess(true); else setError(result.error ?? 'Failed to subscribe'); return result.success; }, []);
  const captureLead = useCallback(async (data: { name?: string; email: string; phone?: string; examTarget?: string; source?: string; landingPage?: string }) => { setLoading(true); setError(null); setSuccess(false); const result = await marketingService.captureLead(data); setLoading(false); if (result.success) setSuccess(true); else setError(result.error ?? 'Failed to submit'); return result.success; }, []);
  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { loading, error, success, subscribeNewsletter, captureLead, reset };
}
