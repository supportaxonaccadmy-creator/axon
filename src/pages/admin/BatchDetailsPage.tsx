import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Archive, RotateCcw, Trash2, CheckCircle2, EyeOff, Calendar, Hash, Layers, BookOpen, Video, Users, ShoppingCart, IndianRupee } from 'lucide-react';
import { useBatchDetails } from '@/hooks/useAdminBatches';
import { batchService } from '@/services/lms/batchService';
import { pricingService } from '@/services/lms/pricingService';
import { BatchStatusBadge, BatchPricingCard, BatchAnalyticsCard } from '@/components/admin/batches';
import { ConfirmDialog } from '@/components/admin/common';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import type { LmsStatus } from '@/types/lms';

export function BatchDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { batch, pricing, enrollments, purchases, subjects, classes, stats, loading, error, refresh } = useBatchDetails(id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatusChange = async (newStatus: LmsStatus) => {
    if (!id) return;
    setActionLoading(true);
    await batchService.update(id, { status: newStatus, isPublished: newStatus === 'published' });
    setActionLoading(false); refresh();
  };

  const handleDuplicate = async () => {
    if (!batch) return;
    setActionLoading(true);
    const { data: newBatch } = await batchService.create({
      title: `${batch.title} (Copy)`, slug: `${batch.slug}-copy-${Date.now().toString(36)}`,
      description: batch.description, thumbnail: batch.thumbnail, banner: batch.banner, icon: batch.icon,
      price: batch.price, discountPrice: batch.discountPrice, isFree: batch.isFree, isPublished: false, sortOrder: batch.sortOrder + 1, status: 'draft',
    });
    if (newBatch && pricing) {
      await pricingService.create({ batchId: newBatch.id, price: pricing.price, salePrice: pricing.salePrice, currency: pricing.currency, isFree: pricing.isFree, lifetimeAccess: pricing.lifetimeAccess, accessDurationDays: pricing.accessDurationDays, status: 'draft' });
    }
    setActionLoading(false); navigate('/admin/batches');
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    if (pricing) await pricingService.remove(pricing.id);
    await batchService.remove(id);
    setActionLoading(false); navigate('/admin/batches');
  };

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !batch) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Batch not found'}</div>;

  const completedPurchases = purchases.filter((p) => p.paymentStatus === 'completed');
  const revenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0);
  const activeEnrollments = enrollments.filter((e) => e.accessStatus === 'active');
  const recentPurchases = [...purchases].sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()).slice(0, 5);
  const recentEnrollments = [...enrollments].sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/batches')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{batch.title}</h1>
        <BatchStatusBadge status={batch.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/batches/${batch.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={actionLoading}><Copy className="h-3.5 w-3.5" />Duplicate</Button>
        {batch.status === 'published' ? (
          <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
        ) : batch.status === 'archived' ? (
          <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
        ) : (
          <Button variant="success" size="sm" onClick={() => handleStatusChange('published')} disabled={actionLoading}><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>
        )}
        {batch.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => handleStatusChange('archived')} disabled={actionLoading}><Archive className="h-3.5 w-3.5" />Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">General Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Layers className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Title:</span><span className="text-sm font-medium text-neutral-900">{batch.title}</span></div>
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Slug:</span><span className="font-mono text-sm text-neutral-900">/{batch.slug}</span></div>
              {batch.description && <div className="flex items-start gap-3"><BookOpen className="mt-0.5 h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Description:</span><span className="text-sm text-neutral-900">{batch.description}</span></div>}
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Sort Order:</span><span className="text-sm font-medium text-neutral-900">{batch.sortOrder}</span></div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Created:</span><span className="text-sm text-neutral-900">{format(new Date(batch.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Updated:</span><span className="text-sm text-neutral-900">{format(new Date(batch.updatedAt), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>
          <BatchAnalyticsCard stats={stats} enrollmentCount={enrollments.length} purchaseCount={completedPurchases.length} revenue={revenue} loading={loading} />
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Content Overview</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col gap-1 rounded-lg border border-neutral-100 p-3"><BookOpen className="h-4 w-4 text-primary-500" /><span className="text-lg font-bold text-neutral-900">{subjects.length}</span><span className="text-[10px] text-neutral-500">Subjects</span></div>
              <div className="flex flex-col gap-1 rounded-lg border border-neutral-100 p-3"><Video className="h-4 w-4 text-accent-500" /><span className="text-lg font-bold text-neutral-900">{classes.length}</span><span className="text-[10px] text-neutral-500">Classes</span></div>
              <div className="flex flex-col gap-1 rounded-lg border border-neutral-100 p-3"><Users className="h-4 w-4 text-success-500" /><span className="text-lg font-bold text-neutral-900">{activeEnrollments.length}</span><span className="text-[10px] text-neutral-500">Active Students</span></div>
              <div className="flex flex-col gap-1 rounded-lg border border-neutral-100 p-3"><ShoppingCart className="h-4 w-4 text-primary-500" /><span className="text-lg font-bold text-neutral-900">{completedPurchases.length}</span><span className="text-[10px] text-neutral-500">Purchases</span></div>
            </div>
          </div>
          {subjects.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-neutral-800">Subjects ({subjects.length})</h2><Button size="sm" variant="outline" onClick={() => navigate('/admin/subjects')}>Manage Subjects</Button></div>
              <div className="space-y-2">{subjects.map((subject, idx) => (
                <div key={subject.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">{idx + 1}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-900">{subject.title}</p><p className="truncate text-xs text-neutral-500">/{subject.slug}</p></div>
                  <BatchStatusBadge status={subject.status} />
                  <Link to={`/admin/subjects/${subject.id}`} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600"><Edit className="h-3.5 w-3.5" /></Link>
                </div>
              ))}</div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800">Recent Purchases</h2>
              {recentPurchases.length === 0 ? <p className="py-4 text-center text-sm text-neutral-500">No purchases yet.</p> : (
                <div className="space-y-2">{recentPurchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-neutral-50">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-neutral-900"><IndianRupee className="inline h-3 w-3" />{p.amount.toLocaleString('en-IN')}</p><p className="text-xs text-neutral-500">{format(new Date(p.purchasedAt), 'MMM d, yyyy')}</p></div>
                    <Badge variant={p.paymentStatus === 'completed' ? 'success' : p.paymentStatus === 'pending' ? 'warning' : 'error'} className="capitalize">{p.paymentStatus}</Badge>
                  </div>
                ))}</div>
              )}
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800">Recent Enrollments</h2>
              {recentEnrollments.length === 0 ? <p className="py-4 text-center text-sm text-neutral-500">No enrollments yet.</p> : (
                <div className="space-y-2">{recentEnrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-neutral-50">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-neutral-900">{e.enrollmentType}</p><p className="text-xs text-neutral-500">{format(new Date(e.enrolledAt), 'MMM d, yyyy')}</p></div>
                    <Badge variant={e.accessStatus === 'active' ? 'success' : 'default'} className="capitalize">{e.accessStatus}</Badge>
                  </div>
                ))}</div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <BatchPricingCard pricing={pricing} loading={loading} />
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/admin/batches/${batch.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit Batch</Button>
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/admin/subjects')}><BookOpen className="h-3.5 w-3.5" />Manage Subjects</Button>
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/admin/chapters')}><BookOpen className="h-3.5 w-3.5" />Manage Chapters</Button>
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/admin/classes')}><Video className="h-3.5 w-3.5" />Manage Classes</Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Batch" message="Are you sure you want to delete this batch? This will also remove related pricing and enrollments. This action cannot be undone." confirmLabel="Delete" loading={actionLoading} />
    </div>
  );
}
