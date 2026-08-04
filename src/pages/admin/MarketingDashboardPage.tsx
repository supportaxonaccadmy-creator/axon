import { memo, useState, useEffect, useCallback } from 'react';
import { Users, Mail, TrendingUp, UserPlus } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard } from '@/components/analytics';
import { marketingService } from '@/services/seo';
import type { MarketingLead, NewsletterSubscriber } from '@/services/seo';

function MarketingDashboardPageComponent() {
  const [leads, setLeads] = useState<MarketingLead[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [leadCount, setLeadCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const loadData = useCallback(async () => { const [l, s, lc, sc] = await Promise.all([marketingService.getLeads(10), marketingService.getSubscribers(10), marketingService.getLeadCount(), marketingService.getSubscriberCount()]); setLeads(l); setSubscribers(s); setLeadCount(lc); setSubscriberCount(sc); setLoading(false); }, []);
  useEffect(() => { void loadData(); }, [loadData]);
  return (<PageContainer><SectionHeader title="Marketing Dashboard" description="Track leads, subscribers, and campaign performance" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><AnalyticsCard title="Total Leads" value={leadCount} icon={UserPlus} color="primary" /><AnalyticsCard title="Active Subscribers" value={subscriberCount} icon={Mail} color="success" /><AnalyticsCard title="Conversion Rate" value="--" icon={TrendingUp} color="accent" /><AnalyticsCard title="Active Campaigns" value="--" icon={Users} color="warning" /></div><div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Recent Leads</h3>{loading ? <p className="text-sm text-neutral-400">Loading...</p> : leads.length === 0 ? <p className="text-sm text-neutral-400">No leads yet.</p> : (<div className="space-y-2">{leads.map((lead) => (<div key={lead.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2"><div><p className="text-sm font-medium text-neutral-700">{lead.name ?? lead.email}</p><p className="text-xs text-neutral-400">{lead.examTarget ?? 'N/A'} | {lead.source ?? 'N/A'}</p></div><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${lead.status === 'new' ? 'bg-primary-50 text-primary-700' : 'bg-neutral-50 text-neutral-600'}`}>{lead.status}</span></div>))}</div>)}</div><div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Recent Subscribers</h3>{loading ? <p className="text-sm text-neutral-400">Loading...</p> : subscribers.length === 0 ? <p className="text-sm text-neutral-400">No subscribers yet.</p> : (<div className="space-y-2">{subscribers.map((sub) => (<div key={sub.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2"><div><p className="text-sm font-medium text-neutral-700">{sub.email}</p><p className="text-xs text-neutral-400">{sub.source ?? 'N/A'} | {new Date(sub.subscribedAt).toLocaleDateString()}</p></div><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-50 text-neutral-600'}`}>{sub.status}</span></div>))}</div>)}</div></div></PageContainer>);
}
export const MarketingDashboardPage = memo(MarketingDashboardPageComponent);
