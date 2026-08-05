import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AuditLogCard } from '@/components/monitoring';
import { analyticsMonitoringService } from '@/services/monitoring';

function AuditMonitoringPageComponent() {
  const securityEvents = analyticsMonitoringService.getSecurityMonitoring();
  return (<PageContainer><SectionHeader title="Audit Monitoring" description="Audit events, security monitoring, and compliance tracking" /><div className="mb-6"><div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Security Monitoring</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{securityEvents.map((event) => (<div key={event.metric} className="rounded-lg border border-neutral-100 p-3"><div className="flex items-center justify-between"><p className="text-xs font-medium text-neutral-700">{event.metric}</p><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${event.status === 'healthy' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>{event.status}</span></div><p className="mt-1 text-lg font-bold text-neutral-900">{event.value}</p><p className="text-xs text-neutral-400">{event.description}</p></div>))}</div></div></div><AuditLogCard /></PageContainer>);
}
export const AuditMonitoringPage = memo(AuditMonitoringPageComponent);
