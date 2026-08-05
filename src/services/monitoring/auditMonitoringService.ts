import type { AuditEvent } from './monitoring.types';
import { loggingService } from './loggingService';

class AuditMonitoringService {
  private events: AuditEvent[] = [];
  private maxEvents = 500;
  recordEvent(userId: string | undefined, action: string, module: string, resource: string, outcome: 'success' | 'failure', details?: string, resourceId?: string, ipAddress?: string): void {
    const event: AuditEvent = { id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: new Date().toISOString(), userId, action, module, resource, outcome, details, resourceId, ipAddress };
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) this.events = this.events.slice(0, this.maxEvents);
    loggingService.audit(module, action, details ?? resource, userId);
  }
  getEvents(module?: string, outcome?: 'success' | 'failure', limit = 100): AuditEvent[] { let filtered = this.events; if (module) filtered = filtered.filter((e) => e.module === module); if (outcome) filtered = filtered.filter((e) => e.outcome === outcome); return filtered.slice(0, limit); }
  getSecurityEvents(): AuditEvent[] { return this.events.filter((e) => e.outcome === 'failure' || e.module === 'Security' || e.module === 'Authentication').slice(0, 50); }
  getAuditStats(): { total: number; successful: number; failed: number; securityEvents: number; byModule: Record<string, number> } { const byModule: Record<string, number> = {}; for (const event of this.events) byModule[event.module] = (byModule[event.module] ?? 0) + 1; return { total: this.events.length, successful: this.events.filter((e) => e.outcome === 'success').length, failed: this.events.filter((e) => e.outcome === 'failure').length, securityEvents: this.events.filter((e) => e.outcome === 'failure' || e.module === 'Security').length, byModule }; }
  getMonitoredActions(): { action: string; module: string; description: string }[] {
    return [ { action: 'login', module: 'Authentication', description: 'User login attempts' }, { action: 'logout', module: 'Authentication', description: 'User logout events' }, { action: 'register', module: 'Authentication', description: 'New user registrations' }, { action: 'purchase', module: 'Payments', description: 'Payment transactions' }, { action: 'enroll', module: 'Enrollment', description: 'Student enrollments' }, { action: 'video_watch', module: 'Videos', description: 'Video streaming events' }, { action: 'mcq_attempt', module: 'MCQs', description: 'MCQ test attempts' }, { action: 'live_class_join', module: 'Live Classes', description: 'Live class attendance' }, { action: 'content_create', module: 'Content', description: 'Content creation by admins' }, { action: 'content_update', module: 'Content', description: 'Content updates by admins' }, { action: 'content_delete', module: 'Content', description: 'Content deletion by admins' }, { action: 'settings_change', module: 'Settings', description: 'System settings changes' } ];
  }
}

export const auditMonitoringService = new AuditMonitoringService();
