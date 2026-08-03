import type { PWAMetrics } from './pwa.types';

class PerformanceService {
  private metrics: Partial<PWAMetrics> = {};
  private listeners = new Set<() => void>();

  measureLoadTime(): number {
    if (typeof performance === 'undefined') return 0;
    const navEntries = performance.getEntriesByType('navigation');
    const navEntry = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming) : undefined;
    const loadTime = navEntry ? navEntry.loadEventEnd - navEntry.startTime : 0;
    this.metrics.loadTime = loadTime;
    return loadTime;
  }

  measureFCP(): number {
    if (typeof performance === 'undefined') return 0;
    const entries = performance.getEntriesByName('first-contentful-paint');
    const fcp = entries.length > 0 ? (entries[0]?.startTime ?? 0) : 0;
    this.metrics.firstContentfulPaint = fcp;
    return fcp;
  }

  measureLCP(): number {
    if (typeof performance === 'undefined' || !('PerformanceObserver' in window)) return 0;
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) this.metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      return this.metrics.largestContentfulPaint ?? 0;
    } catch {
      return 0;
    }
  }

  measureTTI(): number {
    if (typeof performance === 'undefined') return 0;
    const navEntries = performance.getEntriesByType('navigation');
    const navEntry = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming) : undefined;
    const tti = navEntry ? navEntry.domInteractive - navEntry.startTime : 0;
    this.metrics.timeToInteractive = tti;
    return tti;
  }

  getMetrics(): Partial<PWAMetrics> {
    return { ...this.metrics };
  }

  measureAll(): Partial<PWAMetrics> {
    this.measureLoadTime();
    this.measureFCP();
    this.measureLCP();
    this.measureTTI();
    return this.getMetrics();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  formatMetric(value: number): string {
    return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(2)}s`;
  }
}

export const performanceService = new PerformanceService();
