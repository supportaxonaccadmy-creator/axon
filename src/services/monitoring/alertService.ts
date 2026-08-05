import type { Alert, AlertSeverity, AlertStatus } from './monitoring.types';
import { loggingService } from './loggingService';

class AlertService {
  private alerts: Alert[] = [];
  private maxAlerts = 200;
  createAlert(title: string, description: string, severity: AlertSeverity, module: string): Alert {
    const alert: Alert = { id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, description, severity, status: 'active', module, createdAt: new Date().toISOString() };
    this.alerts.unshift(alert);
    if (this.alerts.length > this.maxAlerts) this.alerts = this.alerts.slice(0, this.maxAlerts);
    if (severity === 'critical') loggingService.critical('Alert', `${title}: ${description}`);
    else if (severity === 'high') loggingService.error('Alert', `${title}: ${description}`);
    else loggingService.warning('Alert', `${title}: ${description}`);
    return alert;
  }
  acknowledgeAlert(id: string): void { const alert = this.alerts.find((a) => a.id === id); if (alert) { alert.status = 'acknowledged'; alert.acknowledgedAt = new Date().toISOString(); } }
  resolveAlert(id: string): void { const alert = this.alerts.find((a) => a.id === id); if (alert) { alert.status = 'resolved'; alert.resolvedAt = new Date().toISOString(); } }
  getAlerts(status?: AlertStatus, severity?: AlertSeverity, limit = 50): Alert[] { let filtered = this.alerts; if (status) filtered = filtered.filter((a) => a.status === status); if (severity) filtered = filtered.filter((a) => a.severity === severity); return filtered.slice(0, limit); }
  getActiveAlerts(): Alert[] { return this.alerts.filter((a) => a.status === 'active'); }
  getCriticalAlerts(): Alert[] { return this.alerts.filter((a) => a.severity === 'critical' && a.status === 'active'); }
  getAlertStats(): { total: number; active: number; acknowledged: number; resolved: number; critical: number; high: number; medium: number; low: number } {
    return { total: this.alerts.length, active: this.alerts.filter((a) => a.status === 'active').length, acknowledged: this.alerts.filter((a) => a.status === 'acknowledged').length, resolved: this.alerts.filter((a) => a.status === 'resolved').length, critical: this.alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length, high: this.alerts.filter((a) => a.severity === 'high' && a.status === 'active').length, medium: this.alerts.filter((a) => a.severity === 'medium' && a.status === 'active').length, low: this.alerts.filter((a) => a.severity === 'low' && a.status === 'active').length };
  }
  getAlertTypes(): { type: string; description: string; severity: AlertSeverity }[] {
    return [ { type: 'email', description: 'Email alerts sent to administrators', severity: 'high' }, { type: 'dashboard', description: 'Dashboard alerts shown in admin panel', severity: 'medium' }, { type: 'critical', description: 'Critical system alerts requiring immediate action', severity: 'critical' }, { type: 'performance', description: 'Performance degradation alerts', severity: 'medium' }, { type: 'storage', description: 'Storage capacity and access alerts', severity: 'high' }, { type: 'database', description: 'Database health and query performance alerts', severity: 'high' }, { type: 'authentication', description: 'Authentication and session security alerts', severity: 'critical' } ];
  }
}

export const alertService = new AlertService();
