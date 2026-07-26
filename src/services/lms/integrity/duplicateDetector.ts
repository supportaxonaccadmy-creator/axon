import { getSupabaseClient } from '@/lib/supabase';
import type { IntegrityReport, IntegrityIssue } from './hierarchyValidator';

function makeReport(issues: IntegrityIssue[]): IntegrityReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { valid: errors === 0, issues, summary: { errors, warnings } };
}

const DUPLICATE_CHECKS: { table: string; columns: string[]; label: string }[] = [
  { table: 'batches', columns: ['slug'], label: 'Batch' },
  { table: 'subjects', columns: ['batch_id', 'slug'], label: 'Subject' },
  { table: 'chapters', columns: ['subject_id', 'slug'], label: 'Chapter' },
  { table: 'classes', columns: ['chapter_id', 'slug'], label: 'Class' },
  { table: 'videos', columns: ['class_id', 'slug'], label: 'Video' },
  { table: 'pdf_notes', columns: ['class_id', 'slug'], label: 'PDF Note' },
  { table: 'mcq_sets', columns: ['class_id', 'slug'], label: 'MCQ Set' },
  { table: 'batch_pricing', columns: ['batch_id'], label: 'Pricing' },
];

export const duplicateDetector = {
  async detectAllDuplicates(): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    for (const check of DUPLICATE_CHECKS) {
      const selectCols = `id, ${check.columns.join(', ')}, title`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from(check.table).select(selectCols) as any);
      const rows = (data ?? []) as Record<string, unknown>[];
      const groups: Map<string, { id: string; title: string }[]> = new Map();
      for (const row of rows) {
        const key = check.columns.map((c) => String(row[c] ?? '')).join('|');
        const group = groups.get(key) ?? [];
        group.push({ id: String(row.id), title: String(row.title ?? row.id) });
        groups.set(key, group);
      }
      for (const [key, items] of groups) {
        if (items.length > 1) {
          issues.push({
            type: 'duplicate',
            entity: check.table,
            id: items.map((i) => i.id).join(','),
            message: `Duplicate ${check.label} found: ${items.map((i) => `"${i.title}"`).join(', ')} share key [${key}]`,
            severity: 'error',
          });
        }
      }
    }

    return makeReport(issues);
  },

  async detectDuplicateSlugs(table: string): Promise<{ duplicates: { slug: string; ids: string[] }[] }> {
    const supabase = getSupabaseClient();
    const { data } = await supabase.from(table).select('id, slug');
    const slugGroups: Map<string, string[]> = new Map();
    for (const row of (data ?? []) as Record<string, unknown>[]) {
      const slug = String(row.slug);
      const ids = slugGroups.get(slug) ?? [];
      ids.push(String(row.id));
      slugGroups.set(slug, ids);
    }
    return {
      duplicates: Array.from(slugGroups.entries())
        .filter(([, ids]) => ids.length > 1)
        .map(([slug, ids]) => ({ slug, ids })),
    };
  },
};
