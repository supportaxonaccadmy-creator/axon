import type { DurationParts } from '@/types/date';

export function parseDuration(seconds: number): DurationParts {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return { hours: h, minutes: m, seconds: s, totalSeconds: seconds };
}

export function formatDuration(seconds: number): string {
  const parts = parseDuration(seconds);
  if (parts.hours > 0) return `${parts.hours}:${String(parts.minutes).padStart(2, '0')}:${String(parts.seconds).padStart(2, '0')}`;
  return `${parts.minutes}:${String(parts.seconds).padStart(2, '0')}`;
}

export function formatDurationHuman(seconds: number): string {
  const parts = parseDuration(seconds);
  const segments: string[] = [];
  if (parts.hours > 0) segments.push(`${parts.hours}h`);
  if (parts.minutes > 0) segments.push(`${parts.minutes}m`);
  if (parts.seconds > 0 && parts.hours === 0) segments.push(`${parts.seconds}s`);
  return segments.join(' ') || '0s';
}

export function calculateExpiry(enrolledAt: Date | string, durationDays: number | null): Date | null {
  if (durationDays === null) return null;
  const d = typeof enrolledAt === 'string' ? new Date(enrolledAt) : new Date(enrolledAt);
  d.setDate(d.getDate() + durationDays);
  return d;
}

export function daysRemaining(expiresAt: Date | string | null): number | null {
  if (expiresAt === null) return null;
  const d = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function isExpired(expiresAt: Date | string | null): boolean {
  if (expiresAt === null) return false;
  const d = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return d < new Date();
}

export function isExpiringSoon(expiresAt: Date | string | null, thresholdDays: number = 7): boolean {
  if (expiresAt === null) return false;
  const remaining = daysRemaining(expiresAt);
  if (remaining === null) return false;
  return remaining > 0 && remaining <= thresholdDays;
}
