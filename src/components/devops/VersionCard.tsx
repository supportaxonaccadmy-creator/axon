import { memo } from 'react';
import { Tag, Hash } from 'lucide-react';
import { useRelease } from '@/hooks/useRelease';

function VersionCardComponent() {
  const { currentVersion, buildNumber, gitHash, releaseInfo } = useRelease();
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Tag className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Version Information</h3></div><div className="grid grid-cols-2 gap-3 text-xs"><div className="rounded-lg bg-neutral-50 p-3"><p className="text-neutral-400">Version</p><p className="font-mono text-lg font-bold text-neutral-900">{currentVersion}</p></div><div className="rounded-lg bg-neutral-50 p-3"><p className="text-neutral-400">Build</p><p className="font-mono text-lg font-bold text-neutral-900">#{buildNumber}</p></div><div className="rounded-lg bg-neutral-50 p-3"><p className="text-neutral-400">Git Hash</p><p className="flex items-center gap-1 font-mono text-sm font-medium text-neutral-700"><Hash className="h-3 w-3" /> {gitHash.slice(0, 7)}</p></div><div className="rounded-lg bg-neutral-50 p-3"><p className="text-neutral-400">Environment</p><p className="font-mono text-sm font-medium capitalize text-neutral-700">{releaseInfo.environment}</p></div></div></div>);
}
export const VersionCard = memo(VersionCardComponent);
