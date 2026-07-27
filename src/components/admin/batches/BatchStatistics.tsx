import { memo } from 'react';
import { Users, ShoppingCart, IndianRupee, BookOpen, Layers } from 'lucide-react';

interface BatchStatisticsProps {
  totalBatches: number;
  totalEnrollments: number;
  totalPurchases: number;
  totalRevenue: number;
  totalSubjects: number;
  loading?: boolean;
}

function BatchStatisticsComponent({ totalBatches, totalEnrollments, totalPurchases, totalRevenue, totalSubjects, loading = false }: BatchStatisticsProps) {
  if (loading) return <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />)}</div>;

  const items = [
    { label: 'Total Batches', value: totalBatches, icon: Layers, color: 'text-primary-600 bg-primary-50' },
    { label: 'Students', value: totalEnrollments, icon: Users, color: 'text-success-600 bg-success-50' },
    { label: 'Purchases', value: totalPurchases, icon: ShoppingCart, color: 'text-accent-600 bg-accent-50' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success-600 bg-success-50' },
    { label: 'Subjects', value: totalSubjects, icon: BookOpen, color: 'text-primary-600 bg-primary-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((item) => { const Icon = item.icon; return (
        <div key={item.label} className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color}`}><Icon className="h-4 w-4" /></div>
          <div><p className="text-xl font-bold text-neutral-900">{item.value}</p><p className="text-xs text-neutral-500">{item.label}</p></div>
        </div>
      ); })}
    </div>
  );
}

export const BatchStatistics = memo(BatchStatisticsComponent);
