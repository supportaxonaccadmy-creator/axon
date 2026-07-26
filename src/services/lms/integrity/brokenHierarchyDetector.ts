import { getSupabaseClient } from '@/lib/supabase';
import type { IntegrityReport, IntegrityIssue } from './hierarchyValidator';

function makeReport(issues: IntegrityIssue[]): IntegrityReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { valid: errors === 0, issues, summary: { errors, warnings } };
}

export const brokenHierarchyDetector = {
  async detectBrokenHierarchy(): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    const { data: subjects } = await supabase.from('subjects').select('id, batch_id, title');
    const validBatchIds: Set<string> = new Set();
    const { data: batches } = await supabase.from('batches').select('id');
    for (const b of batches ?? []) validBatchIds.add(b.id);

    const validSubjectIds: Set<string> = new Set();
    for (const subject of subjects ?? []) {
      validSubjectIds.add(subject.id);
      if (subject.batch_id && !validBatchIds.has(subject.batch_id)) {
        issues.push({ type: 'broken_hierarchy', entity: 'subject', id: subject.id, message: `Subject "${subject.title}" references broken batch ${subject.batch_id}`, severity: 'error' });
      }
    }

    const { data: chapters } = await supabase.from('chapters').select('id, subject_id, title');
    const validChapterIds: Set<string> = new Set();
    for (const chapter of chapters ?? []) {
      validChapterIds.add(chapter.id);
      if (chapter.subject_id && !validSubjectIds.has(chapter.subject_id)) {
        issues.push({ type: 'broken_hierarchy', entity: 'chapter', id: chapter.id, message: `Chapter "${chapter.title}" references broken subject ${chapter.subject_id}`, severity: 'error' });
      }
    }

    const { data: classes } = await supabase.from('classes').select('id, chapter_id, title');
    const validClassIds: Set<string> = new Set();
    for (const cls of classes ?? []) {
      validClassIds.add(cls.id);
      if (cls.chapter_id && !validChapterIds.has(cls.chapter_id)) {
        issues.push({ type: 'broken_hierarchy', entity: 'class', id: cls.id, message: `Class "${cls.title}" references broken chapter ${cls.chapter_id}`, severity: 'error' });
      }
    }

    for (const childTable of ['videos', 'pdf_notes', 'mcq_sets', 'attachments']) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: children } = await (supabase.from(childTable).select('id, class_id, title') as any);
      for (const child of (children ?? []) as Record<string, unknown>[]) {
        const classId = String(child.class_id ?? '');
        if (classId && !validClassIds.has(classId)) {
          issues.push({ type: 'broken_hierarchy', entity: childTable, id: String(child.id), message: `${childTable} "${child.title ?? child.id}" references broken class ${classId}`, severity: 'error' });
        }
      }
    }

    return makeReport(issues);
  },

  async detectOrphanedContent(): Promise<{ orphaned: { table: string; id: string; title: string }[] }> {
    const report = await this.detectBrokenHierarchy();
    return {
      orphaned: report.issues.map((i) => ({ table: i.entity, id: i.id, title: i.message })),
    };
  },
};
