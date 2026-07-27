import { memo, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

export interface BatchFormData {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  banner: string;
  icon: string;
  price: number;
  discountPrice: number | null;
  isFree: boolean;
  isPublished: boolean;
  status: LmsStatus;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  lifetimeAccess: boolean;
  accessDurationDays: number | null;
}

export interface BatchFormErrors {
  title?: string | undefined;
  slug?: string | undefined;
  price?: string | undefined;
  discountPrice?: string | undefined;
  sortOrder?: string | undefined;
}

interface BatchFormProps {
  form: BatchFormData;
  onFormChange: (field: keyof BatchFormData, value: string | number | boolean | null) => void;
  errors: BatchFormErrors;
  generalError: string | null;
}

const STATUS_OPTIONS: Option[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

function BatchFormComponent({ form, onFormChange, errors, generalError }: BatchFormProps) {
  const handleChange = useCallback((field: keyof BatchFormData, value: string | number | boolean | null) => {
    onFormChange(field, value);
  }, [onFormChange]);

  return (
    <div className="space-y-4">
      {generalError && <Alert variant="error" title="Error">{generalError}</Alert>}
      <Input label="Title" placeholder="e.g. NEET 2026 Complete Course" value={form.title} onChange={(e) => handleChange('title', e.target.value)} error={errors.title} />
      <Input label="Slug" placeholder="e.g. neet-2026-complete-course" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} error={errors.slug} hint="Lowercase letters, numbers, and hyphens only" />
      <Textarea label="Description" placeholder="Brief description of the batch..." value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Thumbnail URL" placeholder="https://..." value={form.thumbnail} onChange={(e) => handleChange('thumbnail', e.target.value)} />
        <Input label="Banner URL" placeholder="https://..." value={form.banner} onChange={(e) => handleChange('banner', e.target.value)} />
      </div>
      <Input label="Icon (optional)" placeholder="e.g. Layers" value={form.icon} onChange={(e) => handleChange('icon', e.target.value)} hint="Lucide icon name" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Price" type="number" value={form.price} onChange={(e) => handleChange('price', Number(e.target.value))} error={errors.price} />
        <Input label="Sale Price (optional)" type="number" value={form.discountPrice ?? ''} onChange={(e) => handleChange('discountPrice', e.target.value ? Number(e.target.value) : null)} error={errors.discountPrice} hint="Must be less than price" />
      </div>
      <div className="flex items-center gap-6">
        <Checkbox label="Free Batch" checked={form.isFree} onChange={(e) => handleChange('isFree', e.target.checked)} />
        <Checkbox label="Lifetime Access" checked={form.lifetimeAccess} onChange={(e) => handleChange('lifetimeAccess', e.target.checked)} />
      </div>
      {!form.lifetimeAccess && (
        <Input label="Access Duration (days)" type="number" value={form.accessDurationDays ?? ''} onChange={(e) => handleChange('accessDurationDays', e.target.value ? Number(e.target.value) : null)} hint="Leave empty for unlimited" />
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => handleChange('sortOrder', Number(e.target.value))} error={errors.sortOrder} />
        <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => handleChange('status', e.target.value as LmsStatus)} />
      </div>
      <Input label="Meta Title (optional)" placeholder="SEO title..." value={form.metaTitle} onChange={(e) => handleChange('metaTitle', e.target.value)} />
      <Textarea label="Meta Description (optional)" placeholder="SEO description..." value={form.metaDescription} onChange={(e) => handleChange('metaDescription', e.target.value)} />
    </div>
  );
}

export const BatchForm = memo(BatchFormComponent);
