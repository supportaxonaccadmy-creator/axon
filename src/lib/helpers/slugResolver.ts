import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { generateSlug, normalizeSlug, isValidSlug } from '@/lib/helpers/slugHelper';

export interface SlugResolutionResult {
  slug: string;
  isUnique: boolean;
  hadConflict: boolean;
}

export const slugResolver = {
  generate(text: string): string {
    return generateSlug(text);
  },

  normalize(slug: string): string {
    return normalizeSlug(slug);
  },

  validate(slug: string): { valid: boolean; error: string | null } {
    if (!slug || slug.trim().length === 0) return { valid: false, error: 'Slug is required' };
    if (!isValidSlug(slug)) return { valid: false, error: 'Slug must be lowercase alphanumeric with hyphens only' };
    return { valid: true, error: null };
  },

  async checkUnique(table: string, slug: string, parentIdColumn?: string, parentId?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    let query = supabase.from(table).select('id').eq('slug', slug);
    if (parentIdColumn && parentId) {
      query = query.eq(parentIdColumn, parentId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      logger.error('slugResolver.checkUnique', { error: error.message });
      return false;
    }
    return data === null;
  },

  async resolve(table: string, text: string, parentIdColumn?: string, parentId?: string): Promise<SlugResolutionResult> {
    let slug = generateSlug(text);
    const isUnique = await this.checkUnique(table, slug, parentIdColumn, parentId);
    if (isUnique) {
      return { slug, isUnique: true, hadConflict: false };
    }

    let counter = 2;
    let candidate = `${slug}-${counter}`;
    while (!(await this.checkUnique(table, candidate, parentIdColumn, parentId))) {
      counter += 1;
      candidate = `${slug}-${counter}`;
    }
    return { slug: candidate, isUnique: true, hadConflict: true };
  },

  async resolveMany(table: string, texts: string[], parentIdColumn?: string, parentId?: string): Promise<SlugResolutionResult[]> {
    const results: SlugResolutionResult[] = [];
    const usedSlugs: string[] = [];
    for (const text of texts) {
      let slug = generateSlug(text);
      if (usedSlugs.includes(slug)) {
        let counter = 2;
        while (usedSlugs.includes(`${slug}-${counter}`)) {
          counter += 1;
        }
        slug = `${slug}-${counter}`;
      }
      const isUnique = await this.checkUnique(table, slug, parentIdColumn, parentId);
      usedSlugs.push(slug);
      results.push({ slug, isUnique, hadConflict: !isUnique });
    }
    return results;
  },
};
