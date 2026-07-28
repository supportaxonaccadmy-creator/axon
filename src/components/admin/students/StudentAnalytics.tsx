import { memo } from 'react';
import { Users, UserCheck, UserX, DollarSign, ShoppingBag, GraduationCap, TrendingUp, Award } from 'lucide-react';
import type { StudentAnalytics as StudentAnalyticsType } from '@/hooks/useAdminStudents';

interface StudentAnalyticsProps {
  analytics: StudentAnalyticsType;
  loading?: boolean;
}

function StudentAnalyticsComponent({ analytics, loading = false }: StudentAnalyticsProps) {
  if (loading) return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />)}</div>;

  const items = [
    { label: 'Total Students', value: analytics.totalStudents, icon: Users, color: 'text-primary-600 bg-primary-50' },
    { label: 'Active', value: analytics.activeStudents, icon: UserCheck, color: 'text-success-600 bg-success-50' },
    { label: 'Inactive', value: analytics.inactiveStudents, icon: UserX, color: 'text-neutral-500 bg-neutral-100' },
    { label: 'Paid', value: analytics.paidStudents, icon: DollarSign, color: 'text-accent-600 bg-accent-50' },
    { label: 'Free', value: analytics.freeStudents, icon: GraduationCap, color: 'text-warning-600 bg-warning-50' },
    { label: 'Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-success-600 bg-success-50' },
    { label: 'Enrollments', value: analytics.totalEnrollments, icon: ShoppingBag, color: 'text-primary-600 bg-primary-50' },
    { label: 'Completion', value: `${analytics.completionRate}%`, icon: Award, color: 'text-accent-600 bg-accent-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {items.map((item) => { const Icon = item.icon; return (
        <div key={item.label} className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color}`}><Icon className="h-4 w-4" /></div>
          <div><p className="text-xl font-bold text-neutral-900">{item.value}</p><p className="text-xs text-neutral-500">{item.label}</p></div>
        </div>
      ); })}
    </div>
  );
}

export const StudentAnalytics = memo(StudentAnalyticsComponent);
