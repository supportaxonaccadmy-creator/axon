import { memo } from 'react';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { RecentStudent } from '@/types/adminDashboard';

interface RecentStudentCardProps { students: RecentStudent[]; loading?: boolean; }

function RecentStudentCardComponent({ students, loading = false }: RecentStudentCardProps) {
  if (loading) return <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (students.length === 0) return <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center"><p className="text-sm text-neutral-500">No recent registrations</p></div>;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Recent Registrations</h3>
      <div className="mt-3 space-y-2">{students.map((s) => (
        <div key={s.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50">
          <Avatar fallback={s.fullName} src={s.avatarUrl ?? undefined} size="sm" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-800">{s.fullName || 'Unnamed'}</p><p className="truncate text-xs text-neutral-500">{s.email}</p></div>
          <div className="flex shrink-0 flex-col items-end gap-1"><Badge variant={s.role === 'admin' ? 'primary' : 'default'} className="capitalize">{s.role}</Badge><span className="text-[10px] text-neutral-400">{s.registeredAt ? format(new Date(s.registeredAt), 'MMM d') : ''}</span></div>
        </div>
      ))}</div>
    </div>
  );
}

export const RecentStudentCard = memo(RecentStudentCardComponent);
