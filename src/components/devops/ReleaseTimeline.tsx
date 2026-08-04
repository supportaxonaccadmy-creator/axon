import { memo } from 'react';
import { Tag, Calendar } from 'lucide-react';
import { useRelease } from '@/hooks/useRelease';

function ReleaseTimelineComponent() {
  const { changelog } = useRelease();
  const typeColor: Record<string, string> = { major: 'bg-error-50 text-error-700', minor: 'bg-primary-50 text-primary-700', patch: 'bg-success-50 text-success-700' };
  const changeColor: Record<string, string> = { added: 'text-success-600', changed: 'text-primary-600', fixed: 'text-warning-600', removed: 'text-error-600' };
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Tag className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Release Timeline</h3></div><div className="relative space-y-4 before:absolute before:left-2 before:top-0 before:h-full before:w-px before:bg-neutral-200">{changelog.map((entry) => (<div key={entry.version} className="relative pl-8"><div className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary-500 bg-white" /><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColor[entry.type] ?? 'bg-neutral-50 text-neutral-600'}`}>v{entry.version}</span><span className="flex items-center gap-1 text-xs text-neutral-400"><Calendar className="h-3 w-3" /> {entry.date}</span><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColor[entry.type]}`}>{entry.type}</span></div><ul className="mt-1.5 space-y-0.5">{entry.changes.map((change, i) => (<li key={i} className={`text-xs ${changeColor[change.type] ?? 'text-neutral-600'}`}><span className="font-medium capitalize">{change.type}:</span> {change.description}</li>))}</ul></div>))}</div></div>);
}
export const ReleaseTimeline = memo(ReleaseTimelineComponent);
