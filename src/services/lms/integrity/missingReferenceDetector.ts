import { getSupabaseClient } from '@/lib/supabase';
import type { IntegrityReport, IntegrityIssue } from './hierarchyValidator';

function makeReport(issues: IntegrityIssue[]): IntegrityReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { valid: errors === 0, issues, summary: { errors, warnings } };
}

const REFERENCE_CHECKS: { child: string; parent: string; fk: string; label: string }[] = [
  { child: 'subjects', parent: 'batches', fk: 'batch_id', label: 'Subject' },
  { child: 'chapters', parent: 'subjects', fk: 'subject_id', label: 'Chapter' },
  { child: 'classes', parent: 'chapters', fk: 'chapter_id', label: 'Class' },
  { child: 'videos', parent: 'classes', fk: 'class_id', label: 'Video' },
  { child: 'pdf_notes', parent: 'classes', fk: 'class_id', label: 'PDF Note' },
  { child: 'mcq_sets', parent: 'classes', fk: 'class_id', label: 'MCQ Set' },
  { child: 'mcq_questions', parent: 'mcq_sets', fk: 'mcq_set_id', label: 'MCQ Question' },
  { child: 'attachments', parent: 'classes', fk: 'class_id', label: 'Attachment' },
  { child: 'batch_pricing', parent: 'batches', fk: 'batch_id', label: 'Pricing' },
  { child: 'purchases', parent: 'batches', fk: 'batch_id', label: 'Purchase' },
  { child: 'purchases', parent: 'batch_pricing', fk: 'pricing_id', label: 'Purchase' },
  { child: 'enrollments', parent: 'batches', fk: 'batch_id', label: 'Enrollment' },
  { child: 'enrollments', parent: 'batch_pricing', fk: 'pricing_id', label: 'Enrollment' },
];

export const missingReferenceDetector = {
  async detectAllMissingReferences(): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    for (const ref of REFERENCE_CHECKS) {
      const selectCols = `id, ${ref.fk}, title`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from(ref.child).select(selectCols) as any);
      const rows = (data ?? []) as Record<string, unknown>[];
      for (const row of rows) {
        const parentId = row[ref.fk];
        if (!parentId) {
          issues.push({ type: 'missing_reference', entity: ref.child, id: String(row.id), message: `${ref.label} "${row.title ?? row.id}" has no ${ref.fk}`, severity: 'error' });
          continue;
        }
        const { data: parent } = await supabase.from(ref.parent).select('id').eq('id', String(parentId)).maybeSingle();
        if (!parent) {
          issues.push({ type: 'missing_reference', entity: ref.child, id: String(row.id), message: `${ref.label} "${row.title ?? row.id}" references missing ${ref.parent} ${parentId}`, severity: 'error' });
        }
      }
    }

    return makeReport(issues);
  },

  async detectMissingReferences(childTable: string, fkColumn: string, parentTable: string): Promise<{ missing: string[] }> {
    const supabase = getSupabaseClient();
    const selectCols = `id, ${fkColumn}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from(childTable).select(selectCols) as any);
    const rows = (data ?? []) as Record<string, unknown>[];
    const missing: string[] = [];
    for (const row of rows) {
      const parentId = row[fkColumn];
      if (!parentId) { missing.push(String(row.id)); continue; }
      const { data: parent } = await supabase.from(parentTable).select('id').eq('id', String(parentId)).maybeSingle();
      if (!parent) missing.push(String(row.id));
    }
    return { missing };
  },
};
