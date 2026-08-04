import { memo } from 'react';
import { Archive, Database } from 'lucide-react';
import { backupService } from '@/services/devops';

function BackupStatusCardComponent() {
  const strategy = backupService.getBackupStrategy();
  const restoreSteps = backupService.getRestoreSteps();
  const drChecklist = backupService.getDisasterRecoveryChecklist();
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Archive className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Backup & Restore</h3></div><div className="mb-4"><h4 className="mb-2 text-xs font-semibold text-neutral-500">Backup Strategy</h4><div className="space-y-1.5">{strategy.map((s, i) => (<div key={i} className="flex items-center justify-between rounded-lg border border-neutral-100 p-2 text-xs"><div className="flex items-center gap-2"><Database className="h-3 w-3 text-neutral-400" /><span className="font-medium text-neutral-600">{s.type}</span></div><div className="text-neutral-400">{s.frequency} | {s.retention}</div></div>))}</div></div><div className="mb-4"><h4 className="mb-2 text-xs font-semibold text-neutral-500">Restore Steps</h4><div className="space-y-1">{restoreSteps.map((step, i) => <div key={i} className="text-xs text-neutral-500">{step}</div>)}</div></div><div><h4 className="mb-2 text-xs font-semibold text-neutral-500">Disaster Recovery Checklist</h4><div className="space-y-1">{drChecklist.map((item) => (<div key={item.id} className="flex items-center gap-2 text-xs"><span className={`rounded-full px-2 py-0.5 font-medium ${item.priority === 'critical' ? 'bg-error-50 text-error-700' : item.priority === 'high' ? 'bg-warning-50 text-warning-700' : 'bg-neutral-50 text-neutral-600'}`}>{item.priority}</span><span className="text-neutral-600">{item.description}</span></div>))}</div></div></div>);
}
export const BackupStatusCard = memo(BackupStatusCardComponent);
