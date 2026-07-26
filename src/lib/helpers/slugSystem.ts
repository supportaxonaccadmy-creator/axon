import { generateSlug, normalizeSlug, isValidSlug, ensureUniqueSlug } from './slugHelper';

export { generateSlug, normalizeSlug, isValidSlug, ensureUniqueSlug };

export const RESERVED_SLUGS: string[] = [
  'admin', 'api', 'auth', 'login', 'register', 'logout', 'settings', 'profile',
  'dashboard', 'search', 'about', 'contact', 'help', 'support', 'terms',
  'privacy', 'policy', 'legal', 'system', 'config', 'static', 'assets',
  'public', 'private', 'internal', 'test', 'debug', 'dev', 'staging',
  'production', 'www', 'mail', 'ftp', 'localhost', 'superuser', 'root',
  'new', 'edit', 'create', 'delete', 'update', 'view', 'list', 'index',
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

export function uniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  return ensureUniqueSlug(baseSlug, existingSlugs);
}

export interface SlugHistoryEntry {
  slug: string;
  createdAt: string;
  reason: 'created' | 'renamed' | 'conflict';
}

const slugHistories: Map<string, SlugHistoryEntry[]> = new Map();

export function slugHistory(entityId: string): SlugHistoryEntry[] {
  return slugHistories.get(entityId) ?? [];
}

export function recordSlugHistory(entityId: string, slug: string, reason: SlugHistoryEntry['reason']): void {
  const history = slugHistories.get(entityId) ?? [];
  history.push({ slug, createdAt: new Date().toISOString(), reason });
  slugHistories.set(entityId, history);
}

export function clearSlugHistory(entityId: string): void {
  slugHistories.delete(entityId);
}

export function autoIncrementSlug(baseSlug: string, existingSlugs: string[]): string {
  const slugSet = new Set(existingSlugs);
  if (!slugSet.has(baseSlug) && !isReservedSlug(baseSlug)) return baseSlug;
  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;
  while (slugSet.has(candidate) || isReservedSlug(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}

export function reservedWords(): string[] {
  return [...RESERVED_SLUGS];
}

export function validateSlugAdvanced(slug: string): { valid: boolean; error: string | null } {
  if (!slug || slug.trim().length === 0) return { valid: false, error: 'Slug is required' };
  if (!isValidSlug(slug)) return { valid: false, error: 'Slug must be lowercase alphanumeric with hyphens only' };
  if (slug.length > 150) return { valid: false, error: 'Slug must not exceed 150 characters' };
  if (isReservedSlug(slug)) return { valid: false, error: 'Slug is reserved and cannot be used' };
  return { valid: true, error: null };
}
