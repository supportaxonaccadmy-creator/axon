import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { batchService } from '@/services/lms/batchService';
import { pricingService } from '@/services/lms/pricingService';
import { Button } from '@/components/ui/Button';
import { BatchForm, type BatchFormData, type BatchFormErrors } from '@/components/admin/batches';
import type { LmsStatus } from '@/types/lms';

interface BatchFormPageProps { mode: 'create' | 'edit'; }

export function BatchFormPage({ mode }: BatchFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<BatchFormErrors>({});

  const [form, setForm] = useState<BatchFormData>({
    title: '', slug: '', description: '', thumbnail: '', banner: '', icon: '',
    price: 0, discountPrice: null, isFree: false, isPublished: false, status: 'draft',
    sortOrder: 0, metaTitle: '', metaDescription: '', lifetimeAccess: false, accessDurationDays: null,
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      Promise.all([batchService.getById(id), pricingService.getByBatchId(id)]).then(([batchResult, pricingResult]) => {
        if (batchResult.error || !batchResult.data) { setError(batchResult.error ?? 'Batch not found'); setLoading(false); return; }
        const b = batchResult.data;
        const p = pricingResult.data;
        setForm({
          title: b.title, slug: b.slug, description: b.description ?? '', thumbnail: b.thumbnail ?? '', banner: b.banner ?? '', icon: b.icon ?? '',
          price: p?.price ?? b.price, discountPrice: p?.salePrice ?? b.discountPrice, isFree: p?.isFree ?? b.isFree,
          isPublished: b.isPublished, status: b.status, sortOrder: b.sortOrder, metaTitle: '', metaDescription: '',
          lifetimeAccess: p?.lifetimeAccess ?? false, accessDurationDays: p?.accessDurationDays ?? null,
        });
        setLoading(false);
      });
    }
  }, [mode, id]);

  const handleFormChange = useCallback((field: keyof BatchFormData, value: string | number | boolean | null) => {
    setForm((f) => ({ ...f, [field]: value }));
  }, []);

  const validate = useCallback(async (): Promise<boolean> => {
    const errs: BatchFormErrors = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    else {
      const { data: existing } = await batchService.getBySlug(form.slug);
      if (existing && existing.id !== id) errs.slug = 'Slug already exists';
    }
    if (!form.isFree && form.price < 0) errs.price = 'Price must be positive';
    if (form.discountPrice !== null && form.discountPrice >= form.price) errs.discountPrice = 'Sale price must be less than price';
    if (form.sortOrder < 0) errs.sortOrder = 'Sort order must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const valid = await validate();
    if (!valid) return;
    setSaving(true);
    const batchPayload = {
      title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim() || null,
      thumbnail: form.thumbnail.trim() || null, banner: form.banner.trim() || null, icon: form.icon.trim() || null,
      price: form.isFree ? 0 : form.price, discountPrice: form.isFree ? null : form.discountPrice,
      isFree: form.isFree, isPublished: form.status === 'published', sortOrder: form.sortOrder, status: form.status as LmsStatus,
    };
    const batchResult = mode === 'create' ? await batchService.create(batchPayload) : await batchService.update(id!, batchPayload);
    if (batchResult.error || !batchResult.data) { setError(batchResult.error ?? 'Failed to save'); setSaving(false); return; }
    const savedBatch = batchResult.data;
    const pricingPayload = {
      batchId: savedBatch.id, price: form.isFree ? 0 : form.price, salePrice: form.isFree ? null : form.discountPrice,
      currency: 'INR', isFree: form.isFree, lifetimeAccess: form.lifetimeAccess,
      accessDurationDays: form.lifetimeAccess ? null : form.accessDurationDays, status: form.status as LmsStatus,
    };
    if (mode === 'edit') {
      const { data: existingPricing } = await pricingService.getByBatchId(id!);
      if (existingPricing) await pricingService.update(existingPricing.id, pricingPayload);
      else await pricingService.create(pricingPayload);
    } else {
      await pricingService.create(pricingPayload);
    }
    setSaving(false);
    navigate('/admin/batches');
  }, [form, id, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/batches')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Batch' : 'Edit Batch'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <BatchForm form={form} onFormChange={handleFormChange} errors={errors} generalError={error} />
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/batches')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Batch' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
