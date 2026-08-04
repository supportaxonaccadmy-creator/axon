export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'session_expired'
  | 'session_revoked'
  | 'permission_denied'
  | 'suspicious_login'
  | 'rate_limit_hit'
  | 'input_validation_failed'
  | 'file_upload_blocked'
  | 'xss_blocked'
  | 'csrf_blocked'
  | 'api_error'
  | 'data_access_denied'
  | 'admin_action'
  | 'password_change'
  | 'role_change'
  | 'device_added'
  | 'device_revoked';

export type SecuritySeverity = 'info' | 'warning' | 'critical';

export interface SecurityAuditEntry {
  id?: string;
  userId?: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  details?: Record<string, unknown>;
  createdAt?: string;
}

export interface DeviceSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  revokedAt: string | null;
}

export interface PermissionCheck {
  resource: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  allowed: boolean;
}

export interface SessionInfo {
  userId: string;
  sessionId: string;
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
  lastActivity: number;
}

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
}
