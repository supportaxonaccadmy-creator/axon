import { useCallback, useEffect } from 'react';
import { analyticsService, utmService } from '@/services/seo';
import type { AnalyticsConfig } from '@/services/seo';

export function useAnalytics(config?: AnalyticsConfig) {
  useEffect(() => { if (config) { analyticsService.setConfig(config); analyticsService.init(); } utmService.captureAndStore(); }, [config]);
  const trackPageView = useCallback((path: string) => { analyticsService.trackPageView(path); }, []);
  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => { analyticsService.trackEvent(eventName, params); }, []);
  const trackConversion = useCallback((conversionId: string, value?: number, currency?: string) => { analyticsService.trackConversion(conversionId, value, currency); }, []);
  const trackSignUp = useCallback((method: string) => { analyticsService.trackEvent('sign_up', { method }); }, []);
  const trackPurchase = useCallback((value: number, currency: string = 'INR') => { analyticsService.trackEvent('purchase', { value, currency }); }, []);
  return { trackPageView, trackEvent, trackConversion, trackSignUp, trackPurchase };
}
