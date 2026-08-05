import type { ErrorEntry, AlertSeverity } from './monitoring.types';
import { loggingService } from './loggingService';

class ErrorTrackingService {
  private errors: ErrorEntry[] = [];
  private maxErrors = 200;

  trackError(name: string, message: string, module: string, stack?: string, context?: Record<string, unknown>): void {
    const existing = this.errors.find((e) => e.name === name && e.message === message);
    if (existing) { existing.count++; existing.lastOccurrence = new Date().toISOString(); }
    else {
      const severity: AlertSeverity = message.includes('critical') || message.includes('fatal') ? 'critical' : 'high';
      const entry: ErrorEntry = { id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: new Date().toISOString(), name, message, stack, module, severity, count: 1, firstOccurrence: new Date().toISOString(), lastOccurrence: new Date().toISOString(), resolved: false, context };
      this.errors.unshift(entry);
      if (this.errors.length > this.maxErrors) this.errors = this.errors.slice(0, this.maxErrors);
    }
    loggingService.error(module, `${name}: ${message}`, { stack, context });
  }

  trackRuntimeError(error: Error, module: string): void { this.trackError(error.name, error.message, module, error.stack); }
  getErrors(unresolvedOnly = false, limit = 50): ErrorEntry[] { let filtered = this.errors; if (unresolvedOnly) filtered = filtered.filter((e) => !e.resolved); return filtered.slice(0, limit); }
  resolveError(id: string): void { const error = this.errors.find((e) => e.id === id); if (error) error.resolved = true; }
  getErrorStats(): { total: number; unresolved: number; critical: number; high: number; medium: number } {
    return { total: this.errors.length, unresolved: this.errors.filter((e) => !e.resolved).length, critical: this.errors.filter((e) => e.severity === 'critical' && !e.resolved).length, high: this.errors.filter((e) => e.severity === 'high' && !e.resolved).length, medium: this.errors.filter((e) => e.severity === 'medium' && !e.resolved).length };
  }
  getErrorsByModule(): Record<string, number> { const counts: Record<string, number> = {}; for (const error of this.errors) { if (!error.resolved) counts[error.module] = (counts[error.module] ?? 0) + 1; } return counts; }
}

export const errorTrackingService = new ErrorTrackingService();
