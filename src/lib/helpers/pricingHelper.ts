import type { BatchPricing } from '@/types/lms';

export function formatPrice(price: number, currency: string = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] ?? currency + ' ';
  return `${symbol}${price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function getEffectivePrice(pricing: BatchPricing): number {
  if (pricing.isFree) return 0;
  return pricing.salePrice !== null && pricing.salePrice < pricing.price ? pricing.salePrice : pricing.price;
}

export function getDiscountAmount(pricing: BatchPricing): number {
  if (pricing.isFree || pricing.salePrice === null) return 0;
  return Math.max(0, pricing.price - pricing.salePrice);
}

export function getDiscountPercent(pricing: BatchPricing): number {
  if (pricing.isFree || pricing.salePrice === null || pricing.price === 0) return 0;
  return Math.round(((pricing.price - pricing.salePrice) / pricing.price) * 100);
}

export function hasDiscount(pricing: BatchPricing): boolean {
  return !pricing.isFree && pricing.salePrice !== null && pricing.salePrice < pricing.price;
}

export function isLifetime(pricing: BatchPricing): boolean {
  return pricing.lifetimeAccess || pricing.accessDurationDays === null;
}

export function calculateExpiryDate(pricing: BatchPricing, enrolledAt: Date = new Date()): Date | null {
  if (isLifetime(pricing)) return null;
  const days = pricing.accessDurationDays ?? 0;
  if (days === 0) return null;
  const expiry = new Date(enrolledAt);
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

export function isExpired(expiresAt: string | null): boolean {
  if (expiresAt === null) return false;
  return new Date(expiresAt) < new Date();
}

export function daysUntilExpiry(expiresAt: string | null): number | null {
  if (expiresAt === null) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
