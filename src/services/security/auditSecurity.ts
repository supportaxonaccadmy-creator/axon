import type { SecurityAuditEntry, SecurityEventType, SecuritySeverity } from './security.types';

class AuditSecurityService {
  async log(entry: Omit<SecurityAuditEntry, 'id' | 'createdAt'>): Promise<void> {
    try {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('security_audit_log').insert({
        user_id: entry.userId ?? user?.id ?? null,
        event_type: entry.eventType,
        event_severity: entry.severity,
        ip_address: entry.ipAddress ?? null,
        user_agent: entry.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : null),
        resource_type: entry.resourceType ?? null,
        resource_id: entry.resourceId ?? null,
        action: entry.action ?? null,
        details: entry.details ?? {},
      });
    } catch { /* audit logging should not block operations */ }
  }

  async logEvent(eventType: SecurityEventType, severity: SecuritySeverity = 'info', details?: Record<string, unknown> | undefined): Promise<void> {
    const entry: Omit<SecurityAuditEntry, 'id' | 'createdAt'> = { eventType, severity };
    if (details) entry.details = details;
    await this.log(entry);
  }

  async logAdminAction(action: string, resourceType: string, resourceId: string, details?: Record<string, unknown> | undefined): Promise<void> {
    const entry: Omit<SecurityAuditEntry, 'id' | 'createdAt'> = { eventType: 'admin_action', severity: 'info', action, resourceType, resourceId };
    if (details) entry.details = details;
    await this.log(entry);
  }

  async logSuspiciousLogin(details: Record<string, unknown>): Promise<void> {
    await this.log({ eventType: 'suspicious_login', severity: 'critical', details });
  }

  async logPermissionDenied(resource: string, action: string): Promise<void> {
    await this.log({ eventType: 'permission_denied', severity: 'warning', resourceType: resource, action });
  }

  async getAuditLogs(limit: number = 50, offset: number = 0): Promise<SecurityAuditEntry[]> {
    try {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('security_audit_log').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      if (error || !data) return [];
      return data as unknown as SecurityAuditEntry[];
    } catch { return []; }
  }

  async getLogsByUser(userId: string, limit: number = 50): Promise<SecurityAuditEntry[]> {
    try {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('security_audit_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
      if (error || !data) return [];
      return data as unknown as SecurityAuditEntry[];
    } catch { return []; }
  }
}

export const auditSecurity = new AuditSecurityService();
