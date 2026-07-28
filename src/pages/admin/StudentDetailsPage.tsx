import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Phone, Calendar, ShoppingBag, BookOpen, Award } from 'lucide-react';
import { useStudentDetails } from '@/hooks/useAdminStudents';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EnrollmentTable, PurchaseTable, ProgressCard } from '@/components/admin/students';
import { format } from 'date-fns';

type Tab = 'overview' | 'batches' | 'enrollments' | 'payments' | 'progress' | 'activity';

export function StudentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { student, enrollments, purchases, loading, error } = useStudentDetails(id);
  const [tab, setTab] = useState<Tab>('overview');

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !student) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Student not found'}</div>;

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'batches', label: 'Purchased Batches' },
    { key: 'enrollments', label: 'Enrollments' },
    { key: 'payments', label: 'Payments' },
    { key: 'progress', label: 'Progress' },
    { key: 'activity', label: 'Activity Timeline' },
  ];

  const activeEnrollments = enrollments.filter((e) => e.accessStatus === 'active');
  const completedPurchases = purchases.filter((p) => p.paymentStatus === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/students')}><ArrowLeft className="h-4 w-4" /></Button>
        <Avatar src={student.avatarUrl ?? undefined} alt={student.fullName ?? 'Student'} fallback={student.fullName ?? 'S'} size="md" />
        <div><h1 className="text-2xl font-bold text-neutral-900">{student.fullName ?? 'Unknown'}</h1><p className="text-sm text-neutral-500">{student.email ?? 'No email'}</p></div>
        <Badge variant={student.isActive ? 'success' : 'default'}>{student.isActive ? 'Active' : 'Inactive'}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/students/${student.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 border-b border-neutral-200 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>{t.label}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800">Student Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Email:</span><span className="text-sm text-neutral-900">{student.email ?? '—'}</span></div>
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Mobile:</span><span className="text-sm text-neutral-900">{student.mobile ?? '—'}</span></div>
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Joined:</span><span className="text-sm text-neutral-900">{format(new Date(student.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
                <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Enrollments:</span><span className="text-sm text-neutral-900">{student.enrollmentCount}</span></div>
                <div className="flex items-center gap-3"><ShoppingBag className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Purchases:</span><span className="text-sm text-neutral-900">{student.purchaseCount}</span></div>
                <div className="flex items-center gap-3"><Award className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Total Spent:</span><span className="text-sm font-medium text-success-600">₹{student.totalSpent.toLocaleString()}</span></div>
              </div>
            </div>
          )}

          {tab === 'batches' && (
            <div className="space-y-3">
              {enrollments.length === 0 ? <p className="text-sm text-neutral-500">No purchased batches.</p> : enrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                  <div><p className="text-sm font-semibold text-neutral-900">{e.batchTitle}</p><p className="text-xs text-neutral-500">Enrolled: {format(new Date(e.enrolledAt), 'MMM d, yyyy')}</p></div>
                  <Badge variant={e.accessStatus === 'active' ? 'success' : 'default'}>{e.accessStatus}</Badge>
                </div>
              ))}
            </div>
          )}

          {tab === 'enrollments' && <EnrollmentTable enrollments={enrollments as never} showStudent={false} />}

          {tab === 'payments' && <PurchaseTable purchases={purchases as never} showStudent={false} onView={(pid) => navigate(`/admin/purchases/${pid}`)} />}

          {tab === 'progress' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProgressCard label="Enrollment Progress" value={activeEnrollments.length} max={enrollments.length} />
              <ProgressCard label="Payment Completion" value={completedPurchases.length} max={purchases.length} />
            </div>
          )}

          {tab === 'activity' && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800">Activity Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50"><Calendar className="h-4 w-4 text-primary-600" /></div><div><p className="text-sm font-medium text-neutral-900">Account Created</p><p className="text-xs text-neutral-500">{format(new Date(student.createdAt), 'MMM d, yyyy h:mm a')}</p></div></div>
                {enrollments.map((e) => (
                  <div key={e.id} className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-50"><BookOpen className="h-4 w-4 text-success-600" /></div><div><p className="text-sm font-medium text-neutral-900">Enrolled in {e.batchTitle}</p><p className="text-xs text-neutral-500">{format(new Date(e.enrolledAt), 'MMM d, yyyy')}</p></div></div>
                ))}
                {purchases.map((p) => (
                  <div key={p.id} className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50"><ShoppingBag className="h-4 w-4 text-accent-600" /></div><div><p className="text-sm font-medium text-neutral-900">Purchased {p.batchTitle} (₹{p.amount.toLocaleString()})</p><p className="text-xs text-neutral-500">{format(new Date(p.purchasedAt), 'MMM d, yyyy')}</p></div></div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">UUID</span><span className="font-mono text-xs text-neutral-900">{student.uuid.slice(0, 8)}...</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Enrollments</span><Badge variant="primary">{student.enrollmentCount}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Purchases</span><Badge variant="success">{student.purchaseCount}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Total Spent</span><span className="text-sm font-bold text-success-600">₹{student.totalSpent.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
