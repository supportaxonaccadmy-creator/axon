import { useState, useCallback, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard, GrowthChart, AnalyticsFilterBar } from '@/components/analytics';
import { getSupabaseClient } from '@/lib/supabase';

export function RevenueAnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [stats, setStats] = useState({ totalRevenue: 0, monthlyRevenue: 0, totalPurchases: 0, completedPurchases: 0, pendingPurchases: 0, failedPurchases: 0, averageOrderValue: 0, refundAmount: 0 });
  const [growthData, setGrowthData] = useState<Array<{ label: string; value: number }>>([]);
  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data: purchases } = await supabase.from('purchases').select('amount, payment_status, created_at');
    const rows = purchases ?? [];
    const completed = rows.filter((p) => p.payment_status === 'completed');
    const pending = rows.filter((p) => p.payment_status === 'pending');
    const failed = rows.filter((p) => p.payment_status === 'failed');
    const totalRevenue = completed.reduce((sum, p) => sum + Number(p.amount), 0);
    const now = new Date();
    const monthlyRevenue = completed.filter((p) => new Date(p.created_at as string).getMonth() === now.getMonth()).reduce((sum, p) => sum + Number(p.amount), 0);
    const monthMap = new Map<string, number>();
    for (const p of completed) { const date = new Date(p.created_at as string); const key = date.toLocaleString('en-US', { month: 'short' }); monthMap.set(key, (monthMap.get(key) ?? 0) + Number(p.amount)); }
    const growth = Array.from(monthMap.entries()).map(([label, value]) => ({ label, value }));
    setStats({ totalRevenue, monthlyRevenue, totalPurchases: rows.length, completedPurchases: completed.length, pendingPurchases: pending.length, failedPurchases: failed.length, averageOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0, refundAmount: 0 });
    setGrowthData(growth);
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <PageContainer>
      <SectionHeader title="Revenue Analytics" description="Track revenue, purchases, and growth" />
      <div className="mb-6"><AnalyticsFilterBar period={period} onPeriodChange={setPeriod} /></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="success" />
        <AnalyticsCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue.toLocaleString()}`} icon={TrendingUp} color="primary" />
        <AnalyticsCard title="Total Purchases" value={stats.totalPurchases} icon={ShoppingCart} color="accent" />
        <AnalyticsCard title="Avg Order Value" value={`₹${stats.averageOrderValue.toFixed(0)}`} icon={DollarSign} color="primary" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AnalyticsCard title="Completed" value={stats.completedPurchases} color="success" />
        <AnalyticsCard title="Pending" value={stats.pendingPurchases} color="warning" />
        <AnalyticsCard title="Failed" value={stats.failedPurchases} color="error" />
      </div>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-4 text-sm font-semibold text-neutral-900">Revenue Growth</h3><GrowthChart data={growthData} color="#22c55e" /></div>
    </PageContainer>
  );
}
