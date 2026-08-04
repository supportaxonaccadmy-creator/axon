import { memo } from 'react';
import { Layout, Plus } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';

const LANDING_PAGES = [
  { slug: 'norcet', name: 'NORCET', description: 'Nursing Officer Recruitment Common Eligibility Test' },
  { slug: 'nursing-officer', name: 'Nursing Officer', description: 'Nursing Officer recruitment exam preparation' },
  { slug: 'aiims', name: 'AIIMS', description: 'All India Institute of Medical Sciences nursing exam' },
  { slug: 'esic', name: 'ESIC', description: 'Employees State Insurance Corporation nursing exam' },
  { slug: 'dsssb', name: 'DSSSB', description: 'Delhi Subordinate Services Selection Board nursing exam' },
  { slug: 'cho', name: 'CHO', description: 'Community Health Officer exam preparation' },
  { slug: 'rrb-nursing-officer', name: 'RRB Nursing Officer', description: 'Railway Recruitment Board Nursing Officer exam' },
];

function LandingPageManagementPageComponent() {
  return (<PageContainer><SectionHeader title="Landing Page Management" description="Manage marketing landing pages for exam preparation" /><div className="mb-4 flex justify-end"><button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"><Plus className="h-4 w-4" /> New Landing Page</button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{LANDING_PAGES.map((page) => (<div key={page.slug} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Layout className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">{page.name}</h3></div><p className="mb-4 text-xs text-neutral-500">{page.description}</p><div className="flex items-center justify-between"><span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">Published</span><a href={`/landing/${page.slug}`} className="text-xs font-medium text-primary-600 hover:underline">View Page</a></div></div>))}</div></PageContainer>);
}
export const LandingPageManagementPage = memo(LandingPageManagementPageComponent);
