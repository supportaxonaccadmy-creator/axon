import type { RelativeDateResult } from '@/types/date';

export function relativeDate(date: Date | string): RelativeDateResult {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const seconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  let text: string;
  if (seconds < 60) text = 'just now';
  else if (minutes < 60) text = `${minutes} minute${minutes > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
  else if (hours < 24) text = `${hours} hour${hours > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
  else if (days < 30) text = `${days} day${days > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
  else if (months < 12) text = `${months} month${months > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
  else text = `${years} year${years > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
  return { text, isPast, diffMs };
}

export function relativeShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return isPast ? 'yesterday' : 'tomorrow';
  if (isPast) return `${days} days ago`;
  return `in ${days} days`;
}
