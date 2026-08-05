import type { LogEntry, LogLevel } from './monitoring.types';

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 500;

  log(level: LogLevel, module: string, message: string, metadata?: Record<string, unknown>, userId?: string): void {
    const entry: LogEntry = { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: new Date().toISOString(), level, module, message, metadata, userId };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) this.logs = this.logs.slice(0, this.maxLogs);
    if (level === 'error' || level === 'critical') console.error(`[${level.toUpperCase()}] [${module}] ${message}`);
    else if (level === 'warning') console.warn(`[WARNING] [${module}] ${message}`);
    else if (level === 'debug' && import.meta.env.DEV) console.debug(`[DEBUG] [${module}] ${message}`);
  }

  info(module: string, message: string, metadata?: Record<string, unknown>): void { this.log('info', module, message, metadata); }
  warning(module: string, message: string, metadata?: Record<string, unknown>): void { this.log('warning', module, message, metadata); }
  error(module: string, message: string, metadata?: Record<string, unknown>): void { this.log('error', module, message, metadata); }
  critical(module: string, message: string, metadata?: Record<string, unknown>): void { this.log('critical', module, message, metadata); }
  debug(module: string, message: string, metadata?: Record<string, unknown>): void { this.log('debug', module, message, metadata); }
  audit(module: string, action: string, details: string, userId?: string): void { this.log('audit', module, `${action}: ${details}`, { action, details }, userId); }

  getLogs(level?: LogLevel, module?: string, limit = 100): LogEntry[] {
    let filtered = this.logs;
    if (level) filtered = filtered.filter((l) => l.level === level);
    if (module) filtered = filtered.filter((l) => l.module === module);
    return filtered.slice(0, limit);
  }

  getLogCounts(): Record<LogLevel, number> {
    const counts: Record<LogLevel, number> = { info: 0, warning: 0, error: 0, critical: 0, debug: 0, audit: 0 };
    for (const log of this.logs) counts[log.level]++;
    return counts;
  }

  clearLogs(): void { this.logs = []; }
  getTotalLogs(): number { return this.logs.length; }
}

export const loggingService = new LoggingService();
