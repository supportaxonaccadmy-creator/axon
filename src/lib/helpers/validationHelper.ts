import type { LmsStatus } from '@/types/lms';

export const LMS_STATUSES: LmsStatus[] = ['draft', 'published', 'archived'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTitle(title: unknown): string | null {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.trim().length < 2) {
    return 'Title must be at least 2 characters';
  }
  if (title.length > 200) {
    return 'Title must not exceed 200 characters';
  }
  return null;
}

export function validateSlug(slug: unknown): string | null {
  if (typeof slug !== 'string' || slug.trim().length === 0) {
    return 'Slug is required';
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Slug must be lowercase alphanumeric with hyphens only';
  }
  if (slug.length > 150) {
    return 'Slug must not exceed 150 characters';
  }
  return null;
}

export function validateStatus(status: unknown): string | null {
  if (status === undefined || status === null) return null;
  if (typeof status !== 'string' || !LMS_STATUSES.includes(status as LmsStatus)) {
    return 'Status must be one of: draft, published, archived';
  }
  return null;
}

export function validateSortOrder(sortOrder: unknown): string | null {
  if (sortOrder === undefined || sortOrder === null) return null;
  if (typeof sortOrder !== 'number' || !Number.isInteger(sortOrder) || sortOrder < 0) {
    return 'Sort order must be a non-negative integer';
  }
  return null;
}

export function validatePrice(price: unknown): string | null {
  if (price === undefined || price === null) return null;
  if (typeof price !== 'number' || price < 0) {
    return 'Price must be a non-negative number';
  }
  return null;
}

export function validateBatchInput(input: {
  title: unknown;
  slug: unknown;
  status?: unknown;
  sortOrder?: unknown;
  price?: unknown;
}): ValidationResult {
  const errors: string[] = [];
  const titleError = validateTitle(input.title);
  if (titleError) errors.push(titleError);
  const slugError = validateSlug(input.slug);
  if (slugError) errors.push(slugError);
  const statusError = validateStatus(input.status);
  if (statusError) errors.push(statusError);
  const sortOrderError = validateSortOrder(input.sortOrder);
  if (sortOrderError) errors.push(sortOrderError);
  const priceError = validatePrice(input.price);
  if (priceError) errors.push(priceError);
  return { valid: errors.length === 0, errors };
}

export function validateSubjectInput(input: {
  batchId: unknown;
  title: unknown;
  slug: unknown;
  status?: unknown;
  sortOrder?: unknown;
}): ValidationResult {
  const errors: string[] = [];
  if (typeof input.batchId !== 'string' || input.batchId.trim().length === 0) {
    errors.push('Batch ID is required');
  }
  const titleError = validateTitle(input.title);
  if (titleError) errors.push(titleError);
  const slugError = validateSlug(input.slug);
  if (slugError) errors.push(slugError);
  const statusError = validateStatus(input.status);
  if (statusError) errors.push(statusError);
  const sortOrderError = validateSortOrder(input.sortOrder);
  if (sortOrderError) errors.push(sortOrderError);
  return { valid: errors.length === 0, errors };
}

export function validateChapterInput(input: {
  subjectId: unknown;
  title: unknown;
  slug: unknown;
  status?: unknown;
  sortOrder?: unknown;
}): ValidationResult {
  const errors: string[] = [];
  if (typeof input.subjectId !== 'string' || input.subjectId.trim().length === 0) {
    errors.push('Subject ID is required');
  }
  const titleError = validateTitle(input.title);
  if (titleError) errors.push(titleError);
  const slugError = validateSlug(input.slug);
  if (slugError) errors.push(slugError);
  const statusError = validateStatus(input.status);
  if (statusError) errors.push(statusError);
  const sortOrderError = validateSortOrder(input.sortOrder);
  if (sortOrderError) errors.push(sortOrderError);
  return { valid: errors.length === 0, errors };
}

export function validateClassInput(input: {
  chapterId: unknown;
  title: unknown;
  slug: unknown;
  status?: unknown;
  sortOrder?: unknown;
  duration?: unknown;
}): ValidationResult {
  const errors: string[] = [];
  if (typeof input.chapterId !== 'string' || input.chapterId.trim().length === 0) {
    errors.push('Chapter ID is required');
  }
  const titleError = validateTitle(input.title);
  if (titleError) errors.push(titleError);
  const slugError = validateSlug(input.slug);
  if (slugError) errors.push(slugError);
  const statusError = validateStatus(input.status);
  if (statusError) errors.push(statusError);
  const sortOrderError = validateSortOrder(input.sortOrder);
  if (sortOrderError) errors.push(sortOrderError);
  if (input.duration !== undefined && input.duration !== null) {
    if (typeof input.duration !== 'number' || input.duration < 0) {
      errors.push('Duration must be a non-negative number');
    }
  }
  return { valid: errors.length === 0, errors };
}
