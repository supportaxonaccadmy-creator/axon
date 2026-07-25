export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
): string {
  const slugSet = new Set(existingSlugs);
  if (!slugSet.has(baseSlug)) return baseSlug;

  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;
  while (slugSet.has(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}
