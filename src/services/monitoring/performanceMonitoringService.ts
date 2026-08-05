import type { PerformanceMetric, HealthStatus } from './monitoring.types';
import { loggingService } from './loggingService';

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 300;

  recordMetric(name: string, value: number, unit: string, threshold: number, category: string): void {
    const status: HealthStatus = value <= threshold ? 'healthy' : value <= threshold * 1.5 ? 'degraded' : 'unhealthy';
    const metric: PerformanceMetric = { id: `metric-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: new Date().toISOString(), name, value, unit, threshold, status, category };
    this.metrics.unshift(metric);
    if (this.metrics.length > this.maxMetrics) this.metrics = this.metrics.slice(0, this.maxMetrics);
    if (status !== 'healthy') loggingService.warning('Performance', `${name} exceeded threshold: ${value}${unit} > ${threshold}${unit}`);
  }

  getMetrics(category?: string, limit = 50): PerformanceMetric[] { let filtered = this.metrics; if (category) filtered = filtered.filter((m) => m.category === category); return filtered.slice(0, limit); }
  getLatestMetrics(): PerformanceMetric[] { const categories = [...new Set(this.metrics.map((m) => m.category))]; return categories.map((cat) => this.metrics.find((m) => m.category === cat)).filter((m): m is PerformanceMetric => m !== undefined); }
  getPerformanceScore(): number { if (this.metrics.length === 0) return 100; const healthy = this.metrics.filter((m) => m.status === 'healthy').length; return Math.round((healthy / this.metrics.length) * 100); }
  getDefaultMetrics(): PerformanceMetric[] {
    return [
      { id: 'pm-1', timestamp: new Date().toISOString(), name: 'Page Load Time', value: 1.2, unit: 's', threshold: 2.0, status: 'healthy', category: 'Frontend' },
      { id: 'pm-2', timestamp: new Date().toISOString(), name: 'API Response Time', value: 85, unit: 'ms', threshold: 200, status: 'healthy', category: 'API' },
      { id: 'pm-3', timestamp: new Date().toISOString(), name: 'Database Query Time', value: 35, unit: 'ms', threshold: 100, status: 'healthy', category: 'Database' },
      { id: 'pm-4', timestamp: new Date().toISOString(), name: 'Memory Usage', value: 45, unit: 'MB', threshold: 100, status: 'healthy', category: 'System' },
      { id: 'pm-5', timestamp: new Date().toISOString(), name: 'Bundle Size', value: 392, unit: 'KB', threshold: 500, status: 'healthy', category: 'Frontend' },
      { id: 'pm-6', timestamp: new Date().toISOString(), name: 'FPS', value: 60, unit: 'fps', threshold: 30, status: 'healthy', category: 'Frontend' },
      { id: 'pm-7', timestamp: new Date().toISOString(), name: 'Render Time', value: 120, unit: 'ms', threshold: 300, status: 'healthy', category: 'Frontend' },
      { id: 'pm-8', timestamp: new Date().toISOString(), name: 'FCP', value: 0.8, unit: 's', threshold: 1.8, status: 'healthy', category: 'Frontend' },
      { id: 'pm-9', timestamp: new Date().toISOString(), name: 'LCP', value: 1.8, unit: 's', threshold: 2.5, status: 'healthy', category: 'Frontend' },
      { id: 'pm-10', timestamp: new Date().toISOString(), name: 'CLS', value: 0.02, unit: '', threshold: 0.1, status: 'healthy', category: 'Frontend' },
    ];
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
