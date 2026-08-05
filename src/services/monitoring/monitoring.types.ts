export type LogLevel = 'info' | 'warning' | 'error' | 'critical' | 'debug' | 'audit';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
export type MetricType = 'gauge' | 'counter' | 'histogram' | 'timer';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  metadata?: Record<string, unknown> | undefined;
  userId?: string | undefined;
  sessionId?: string | undefined;
}

export interface ErrorEntry {
  id: string;
  timestamp: string;
  name: string;
  message: string;
  stack?: string | undefined;
  module: string;
  severity: AlertSeverity;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  resolved: boolean;
  context?: Record<string, unknown> | undefined;
}

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: HealthStatus;
  category: string;
}

export interface HealthCheck {
  id: string;
  component: string;
  status: HealthStatus;
  message: string;
  responseTime: number;
  timestamp: string;
  lastChecked: string;
}

export interface UptimeRecord {
  id: string;
  component: string;
  status: HealthStatus;
  uptime: number;
  responseTime: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  module: string;
  createdAt: string;
  acknowledgedAt?: string | undefined;
  resolvedAt?: string | undefined;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string | undefined;
  action: string;
  module: string;
  resource: string;
  resourceId?: string | undefined;
  outcome: 'success' | 'failure';
  details?: string | undefined;
  ipAddress?: string | undefined;
}

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  status: HealthStatus;
  timestamp: string;
}

export interface MonitoringSummary {
  overallHealth: number;
  status: HealthStatus;
  activeAlerts: number;
  criticalAlerts: number;
  errorCount: number;
  warningCount: number;
  uptimePercentage: number;
  activeUsers: number;
  performanceScore: number;
  totalLogs: number;
  components: { name: string; status: HealthStatus; uptime: number }[];
}

export interface MonitoringReport {
  id: string;
  name: string;
  timestamp: string;
  summary: MonitoringSummary;
  healthChecks: HealthCheck[];
  recentErrors: ErrorEntry[];
  recentAlerts: Alert[];
  metrics: SystemMetric[];
  recommendations: string[];
}
