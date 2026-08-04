import { memo } from 'react';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

interface ModuleHealthCardProps { modules: { id: string; name: string; status: string; testCount: number; lastRun: string }[]; }

function ModuleHealthCardComponent({ modules }: ModuleHealthCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Activity className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Module Health</h3></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{modules.map((mod) => (<div key={mod.id} className="flex items-center gap-2 rounded-lg border border-neutral-100 p-2.5">{mod.status === 'pass' ? <CheckCircle className="h-4 w-4 text-success-500" /> : <XCircle className="h-4 w-4 text-error-500" />}<div><p className="text-xs font-medium text-neutral-700">{mod.name}</p><p className="text-xs text-neutral-400">{mod.testCount} tests</p></div></div>))}</div>
    </div>
  );
}
export const ModuleHealthCard = memo(ModuleHealthCardComponent);
