import { useState, useEffect, useCallback } from 'react';
import { performanceService } from '@/services/pwa';
import type { PWAMetrics } from '@/services/pwa';

export function usePerformance() {
  const [metrics, setMetrics] = useState<Partial<PWAMetrics>>({});

  useEffect(() => {
    const measure = () => {
      const m = performanceService.measureAll();
      setMetrics(m);
    };
    if (document.readyState === 'complete') measure();
    else window.addEventListener('load', measure);
    return () => window.removeEventListener('load', measure);
  }, []);

  const refresh = useCallback(() => {
    setMetrics(performanceService.measureAll());
  }, []);

  return { metrics, refresh };
}
