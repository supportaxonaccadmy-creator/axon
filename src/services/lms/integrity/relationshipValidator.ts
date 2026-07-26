import { getSupabaseClient } from '@/lib/supabase';
import type { IntegrityReport, IntegrityIssue } from './hierarchyValidator';

function makeReport(issues: IntegrityIssue[]): IntegrityReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { valid: errors === 0, issues, summary: { errors, warnings } };
}

const RELATIONSHIPS: { child: string; parent: string; fk: string; childLabel: string }[] = [
  { child: 'subjects', parent: 'batches', fk: 'batch_id', childLabel: 'Subject' },
  { child: 'chapters', parent: 'subjects', fk: 'subject_id', childLabel: 'Chapter' },
  { child: 'classes', parent: 'chapters', fk: 'chapter_id', childLabel: 'Class' },
  { child: 'videos', parent: 'classes', fk: 'class_id', childLabel: 'Video' },
  { child: 'pdf_notes', parent: 'classes', fk: 'class_id', childLabel: 'PDF Note' },
  { child: 'mcq_sets', parent: 'classes', fk: 'class_id', childLabel: 'MCQ Set' },
  { child: 'mcq_questions', parent: 'mcq_sets', fk: 'mcq_set_id', childLabel: 'MCQ Question' },
  { child: 'attachments', parent: 'classes', fk: 'class_id', childLabel: 'Attachment' },
  { child: 'batch_pricing', parent: 'batches', fk: 'batch_id', childLabel: 'Pricing' },
  { child: 'purchases', parent: 'batches', fk: 'batch_id', childLabel: 'Purchase' },
  { child: 'enrollments', parent: 'batches', fk: 'batch_id', childLabel: 'Enrollment' },
];

export const relationshipValidator = {
  async validateAllRelationships(): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    for (const rel of RELATIONSHIPS) {
      const selectCols = `id, ${rel.fk}, title`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from(rel.child).select(selectCols) as any);
      const rows = (data ?? []) as Record<string, unknown>[];
      for (const row of rows) {
        const parentId = row[rel.fk];
        if (!parentId) {
          issues.push({ type: 'missing_fk', entity: rel.child, id: String(row.id), message: `${rel.childLabel} "${row.title ?? row.id}" has no ${rel.fk}`, severity: 'error' });
          continue;
        }
        const { data: parent } = await supabase.from(rel.parent).select('id').eq('id', String(parentId)).maybeSingle();
        if (!parent) {
          issues.push({ type: 'broken_fk', entity: rel.child, id: String(row.id), message: `${rel.childLabel} "${row.title ?? row.id}" references non-existent ${rel.parent} ${parentId}`, severity: 'error' });
        }
      }
    }

    return makeReport(issues);
  },

  async validateRelationship(childTable: string, parentId: string, fkColumn: string): Promise<{ valid: boolean; orphans: string[] }> {
    const supabase = getSupabaseClient();
    const { data } = await supabase.from(childTable).select('id').eq(fkColumn, parentId);
    return { valid: (data ?? []).length > 0, orphans: (data ?? []).map((r: { id: string }) => r.id) };
  },
};
