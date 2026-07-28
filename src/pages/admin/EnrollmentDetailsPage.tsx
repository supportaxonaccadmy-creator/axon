import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { enrollmentService } from '@/services/lms/enrollmentService';
import { batchService } from '@/services/lms/batchService';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EnrollmentStatusBadge } from '@/components/admin/students';
import { format } from 'date-fns';
import type { Enrollment, Batch } from '@/types/lms';

export function EnrollmentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [studentName, setStudentName] = useState<string>('Unknown');
  const [studentEmail, setStudentEmail] = useState<string>('Unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    enrollmentService.getById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'Enrollment not found'); setLoading(false); return; }
      setEnrollment(data);
      const { data: batchData } = await batchService.getById(data.batchId);
      if (batchData) setBatch(batchData);
      const supabase = getSupabaseClient();
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.profileId).maybeSingle();
      if (profile) {
        const row = profile as { full_name: string | null; email: string | null };
        setStudentName(row.full_name ?? 'Unknown');
        setStudentEmail(row.email ?? 'Unknown');
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !enrollment) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Enrollment not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/enrollments')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">Enrollment Details</h1>
        <EnrollmentStatusBadge status={enrollment.accessStatus} />
      </div>
      <div className="flex flex-wrap gap-2">
        {enrollment.accessStatus !== 'active' && <Button variant="success" size="sm" onClick={async () => { await enrollmentService.activateEnrollment(enrollment.id); navigate('/admin/enrollments'); }}><CheckCircle2 className="h-3.5 w-3.5" />Activate</Button>}
        {enrollment.accessStatus !== 'expired' && <Button variant="outline" size="sm" onClick={async () => { await enrollmentService.expireEnrollment(enrollment.id); navigate('/admin/enrollments'); }}><Clock className="h-3.5 w-3.5" />Expire</Button>}
        {enrollment.accessStatus !== 'cancelled' && <Button variant="danger" size="sm" onClick={async () => { await enrollmentService.cancelEnrollment(enrollment.id); navigate('/admin/enrollments'); }}><XCircle className="h-3.5 w-3.5" />Cancel</Button>}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-neutral-800">Enrollment Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><User className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Student:</span><span className="text-sm font-medium text-neutral-900">{studentName}</span></div>
            <div className="flex items-center gap-3"><User className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Email:</span><span className="text-sm text-neutral-900">{studentEmail}</span></div>
            {batch && <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Batch:</span><span className="text-sm font-medium text-neutral-900">{batch.title}</span></div>}
            <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Enrolled:</span><span className="text-sm text-neutral-900">{format(new Date(enrollment.enrolledAt), 'MMM d, yyyy h:mm a')}</span></div>
            <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Expires:</span><span className="text-sm text-neutral-900">{enrollment.expiresAt ? format(new Date(enrollment.expiresAt), 'MMM d, yyyy') : 'Never'}</span></div>
            <div className="flex items-center gap-3"><Badge variant="default" className="text-xs">Type: {enrollment.enrollmentType}</Badge></div>
          </div>
        </div>
      </div>
    </div>
  );
}
