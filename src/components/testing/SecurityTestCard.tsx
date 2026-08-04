import { memo } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { securityTestingService } from '@/services/testing';

function SecurityTestCardComponent() {
  const findings = securityTestingService.getSecurityFindings();
  const score = securityTestingService.getSecurityScore();
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Shield className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Security Tests</h3></div><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${score.percentage === 100 ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>{score.percentage}% - {score.status}</span></div>
      <div className="space-y-1.5">{findings.map((finding) => (<div key={finding.id} className="flex items-start gap-2 rounded-lg border border-neutral-100 p-2">{finding.status === 'pass' ? <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-500" /> : <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-error-500" />}<div className="flex-1"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${finding.severity === 'critical' ? 'bg-error-50 text-error-700' : finding.severity === 'high' ? 'bg-warning-50 text-warning-700' : 'bg-neutral-50 text-neutral-600'}`}>{finding.severity}</span><span className="text-xs font-medium text-neutral-700">{finding.name}</span></div><p className="mt-0.5 text-xs text-neutral-500">{finding.description}</p></div></div>))}</div>
    </div>
  );
}
export const SecurityTestCard = memo(SecurityTestCardComponent);
