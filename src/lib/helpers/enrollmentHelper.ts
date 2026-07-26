import type { Enrollment, EnrollmentStatus, BatchPricing } from '@/types/lms';

export function isActive(enrollment: Enrollment): boolean {
  return enrollment.accessStatus === 'active' && !isEnrollmentExpired(enrollment);
}

export function isEnrollmentExpired(enrollment: Enrollment): boolean {
  if (enrollment.accessStatus === 'expired') return true;
  if (enrollment.accessStatus === 'cancelled') return true;
  if (enrollment.expiresAt === null) return false;
  return new Date(enrollment.expiresAt) < new Date();
}

export function isCancelled(enrollment: Enrollment): boolean {
  return enrollment.accessStatus === 'cancelled';
}

export function hasAccess(enrollment: Enrollment): boolean {
  return isActive(enrollment);
}

export function getAccessStatus(enrollment: Enrollment): EnrollmentStatus {
  if (isEnrollmentExpired(enrollment)) return 'expired';
  return enrollment.accessStatus;
}

export function calculateExpiryFromPricing(pricing: BatchPricing, enrolledAt: string): string | null {
  if (pricing.lifetimeAccess || pricing.accessDurationDays === null) return null;
  const date = new Date(enrolledAt);
  date.setDate(date.getDate() + pricing.accessDurationDays);
  return date.toISOString();
}

export function daysRemaining(enrollment: Enrollment): number | null {
  if (enrollment.expiresAt === null) return null;
  const diff = new Date(enrollment.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatEnrollmentDate(enrollment: Enrollment): string {
  return new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatExpiryDate(enrollment: Enrollment): string {
  if (enrollment.expiresAt === null) return 'Lifetime';
  return new Date(enrollment.expiresAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
