import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { ReleaseTimeline, VersionCard } from '@/components/devops';
import { useRelease } from '@/hooks/useRelease';

function ReleaseManagementPageComponent() {
  const { checklist, generateNotes, currentVersion } = useRelease();
  const releaseNotes = generateNotes(currentVersion);
  return (<PageContainer><SectionHeader title="Release Management" description="Version tracking, changelog, and release checklists" /><div className="mb-6"><VersionCard /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><ReleaseTimeline /><div className="space-y-4"><div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Release Checklist</h3><div className="space-y-2">{checklist.map((item) => (<div key={item.id} className="flex items-center gap-2 text-sm text-neutral-600"><span className="h-2 w-2 rounded-full bg-neutral-300" />{item.description}{item.required && <span className="text-xs text-error-500">*Required</span>}</div>))}</div></div><div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Release Notes (v{currentVersion})</h3><pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs text-neutral-600">{releaseNotes}</pre></div></div></div></PageContainer>);
}
export const ReleaseManagementPage = memo(ReleaseManagementPageComponent);
