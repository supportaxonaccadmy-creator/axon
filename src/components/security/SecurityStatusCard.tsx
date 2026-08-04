import { memo } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Eye, FileLock } from 'lucide-react';

function SecurityStatusCardComponent() {
  const features = [
    { label: 'RLS Enabled', icon: ShieldCheck, active: true, color: 'text-success-600' },
    { label: 'Session Security', icon: Lock, active: true, color: 'text-success-600' },
    { label: 'Input Sanitization', icon: Eye, active: true, color: 'text-success-600' },
    { label: 'Secure Storage', icon: FileLock, active: true, color: 'text-success-600' },
    { label: 'Audit Logging', icon: ShieldAlert, active: true, color: 'text-success-600' },
  ];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50"><ShieldCheck className="h-4 w-4 text-success-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Security Status</h3></div>
      <div className="space-y-2">{features.map((feature) => (<div key={feature.label} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2"><div className="flex items-center gap-2"><feature.icon className={`h-4 w-4 ${feature.color}`} /><span className="text-sm text-neutral-700">{feature.label}</span></div><span className={`text-xs font-medium ${feature.active ? 'text-success-600' : 'text-error-600'}`}>{feature.active ? 'Active' : 'Inactive'}</span></div>))}</div>
    </div>
  );
}
export const SecurityStatusCard = memo(SecurityStatusCardComponent);
