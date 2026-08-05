import type { SystemMetric, HealthStatus } from './monitoring.types';
import { loggingService } from './loggingService';

class SystemMetricsService {
  private metrics: SystemMetric[] = [];
  recordMetric(name: string, value: number, unit: string, category: string, threshold?: number): void {
    const status: HealthStatus = threshold !== undefined ? (value <= threshold ? 'healthy' : value <= threshold * 1.5 ? 'degraded' : 'unhealthy') : 'healthy';
    const metric: SystemMetric = { id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, value, unit, category, status, timestamp: new Date().toISOString() };
    this.metrics.unshift(metric);
    if (this.metrics.length > 200) this.metrics = this.metrics.slice(0, 200);
    if (status !== 'healthy') loggingService.warning('System', `${name}: ${value}${unit} (threshold: ${threshold ?? 'N/A'}${unit})`);
  }
  getMetrics(category?: string, limit = 50): SystemMetric[] { let filtered = this.metrics; if (category) filtered = filtered.filter((m) => m.category === category); return filtered.slice(0, limit); }
  getDefaultMetrics(): SystemMetric[] {
    return [ { id: 'sm-1', name: 'Active Users', value: 248, unit: '', category: 'Users', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-2', name: 'API Requests/min', value: 1200, unit: '/min', category: 'API', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-3', name: 'Database Connections', value: 12, unit: '', category: 'Database', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-4', name: 'Storage Used', value: 4.2, unit: 'GB', category: 'Storage', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-5', name: 'Memory Usage', value: 45, unit: 'MB', category: 'System', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-6', name: 'CPU Usage', value: 15, unit: '%', category: 'System', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-7', name: 'Error Rate', value: 0.1, unit: '%', category: 'Errors', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-8', name: 'Avg Response Time', value: 85, unit: 'ms', category: 'Performance', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-9', name: 'Cache Hit Rate', value: 94, unit: '%', category: 'Performance', status: 'healthy', timestamp: new Date().toISOString() }, { id: 'sm-10', name: 'WebSocket Connections', value: 45, unit: '', category: 'Realtime', status: 'healthy', timestamp: new Date().toISOString() } ];
  }
  getMetricCategories(): string[] { return [...new Set(this.metrics.map((m) => m.category))]; }
}

export const systemMetricsService = new SystemMetricsService();
