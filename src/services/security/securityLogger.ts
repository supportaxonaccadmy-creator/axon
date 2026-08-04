import { auditSecurity } from './auditSecurity';
import type { SecurityEventType, SecuritySeverity } from './security.types';

type LogFn = (message: string, context?: Record<string, unknown>) => void;

class SecurityLoggerService {
  private consoleEnabled: boolean = typeof console !== 'undefined' && import.meta.env?.DEV !== false;
  log(eventType: SecurityEventType, severity: SecuritySeverity, message: string, context?: Record<string, unknown>): void {
    if (this.consoleEnabled) { const logFn: LogFn = severity === 'critical' ? console.error : severity === 'warning' ? console.warn : console.info; logFn(`[Security:${eventType}] ${message}`, context ?? {}); }
    void auditSecurity.log({ eventType, severity, details: { message, ...context } });
  }
  info(eventType: SecurityEventType, message: string, context?: Record<string, unknown>): void { this.log(eventType, 'info', message, context); }
  warn(eventType: SecurityEventType, message: string, context?: Record<string, unknown>): void { this.log(eventType, 'warning', message, context); }
  critical(eventType: SecurityEventType, message: string, context?: Record<string, unknown>): void { this.log(eventType, 'critical', message, context); }
}

export const securityLogger = new SecurityLoggerService();
