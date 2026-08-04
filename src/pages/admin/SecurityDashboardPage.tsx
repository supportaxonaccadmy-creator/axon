import { memo } from 'react';
import { Shield, Lock, Eye, ScrollText } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard } from '@/components/analytics';
import { SecurityStatusCard, AuditLogCard } from '@/components/security';

function SecurityDashboardPageComponent() {
  return (
    <PageContainer>
      <SectionHeader title="Security Dashboard" description="Monitor and manage application security" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnalyticsCard title="RLS Policies" value="55 Tables" icon={Lock} color="success" />
        <AnalyticsCard title="Audit Events" value="Active" icon={ScrollText} color="primary" />
        <AnalyticsCard title="Session Security" value="Enabled" icon={Shield} color="accent" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><SecurityStatusCard /><AuditLogCard /></div>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><Eye className="h-4 w-4 text-primary-500" /> Security Features Active</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Row Level Security on all tables</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Anon role access revoked</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Function search paths secured</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Input sanitization and XSS protection</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Session timeout and auto-logout</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Device tracking and session revocation</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Permission matrix enforcement</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Security audit logging</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Secure storage with encryption</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> CSP and security headers</li>
        </ul>
      </div>
    </PageContainer>
  );
}
export const SecurityDashboardPage = memo(SecurityDashboardPageComponent);
