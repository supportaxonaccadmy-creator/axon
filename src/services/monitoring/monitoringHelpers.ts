import type { LogLevel, HealthStatus } from './monitoring.types';

export function getLogLevelColor(level: LogLevel): string {
  switch (level) { case 'info': return 'bg-primary-50 text-primary-700'; case 'warning': return 'bg-warning-50 text-warning-700'; case 'error': return 'bg-error-50 text-error-700'; case 'critical': return 'bg-error-100 text-error-800'; case 'debug': return 'bg-neutral-50 text-neutral-600'; case 'audit': return 'bg-accent-50 text-accent-700'; default: return 'bg-neutral-50 text-neutral-600'; }
}
export function getHealthStatusColor(status: HealthStatus): string {
  switch (status) { case 'healthy': return 'bg-success-50 text-success-700'; case 'degraded': return 'bg-warning-50 text-warning-700'; case 'unhealthy': return 'bg-error-50 text-error-700'; case 'unknown': return 'bg-neutral-50 text-neutral-500'; default: return 'bg-neutral-50 text-neutral-500'; }
}
export function getHealthStatusIcon(status: HealthStatus): string {
  switch (status) { case 'healthy': return 'text-success-500'; case 'degraded': return 'text-warning-500'; case 'unhealthy': return 'text-error-500'; case 'unknown': return 'text-neutral-400'; default: return 'text-neutral-400'; }
}
export function formatUptime(percentage: number): string { if (percentage >= 99.99) return '99.99%'; return `${percentage.toFixed(2)}%`; }
export function formatResponseTime(ms: number): string { if (ms < 1000) return `${Math.round(ms)}ms`; return `${(ms / 1000).toFixed(2)}s`; }
export function getAlertSeverityColor(severity: string): string {
  switch (severity) { case 'critical': return 'bg-error-100 text-error-800'; case 'high': return 'bg-error-50 text-error-700'; case 'medium': return 'bg-warning-50 text-warning-700'; case 'low': return 'bg-primary-50 text-primary-700'; case 'info': return 'bg-neutral-50 text-neutral-600'; default: return 'bg-neutral-50 text-neutral-600'; }
}
export function getAlertStatusColor(status: string): string {
  switch (status) { case 'active': return 'bg-error-50 text-error-700'; case 'acknowledged': return 'bg-warning-50 text-warning-700'; case 'resolved': return 'bg-success-50 text-success-700'; default: return 'bg-neutral-50 text-neutral-600'; }
}
