import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface IntegrityIssue {
  type: string;
  entity: string;
  id: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface IntegrityReport {
  valid: boolean;
  issues: IntegrityIssue[];
  summary: { errors: number; warnings: number };
}

function makeReport(issues: IntegrityIssue[]): IntegrityReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { valid: errors === 0, issues, summary: { errors, warnings } };
}

export const hierarchyValidator = {
  async validateBatchHierarchy(batchId: string): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    const { data: batch } = await supabase.from('batches').select('id, title').eq('id', batchId).maybeSingle();
    if (!batch) {
      issues.push({ type: 'missing_batch', entity: 'batch', id: batchId, message: 'Batch does not exist', severity: 'error' });
      return makeReport(issues);
    }

    const { data: subjects } = await supabase.from('subjects').select('id, batch_id, title, slug, status').eq('batch_id', batchId);
    for (const subject of subjects ?? []) {
      if (!subject.batch_id) {
        issues.push({ type: 'missing_parent', entity: 'subject', id: subject.id, message: `Subject "${subject.title}" has no batch_id`, severity: 'error' });
      }
      const { data: chapters } = await supabase.from('chapters').select('id, subject_id, title, slug, status').eq('subject_id', subject.id);
      for (const chapter of chapters ?? []) {
        if (!chapter.subject_id) {
          issues.push({ type: 'missing_parent', entity: 'chapter', id: chapter.id, message: `Chapter "${chapter.title}" has no subject_id`, severity: 'error' });
        }
        const { data: classes } = await supabase.from('classes').select('id, chapter_id, title, slug, status').eq('chapter_id', chapter.id);
        for (const cls of classes ?? []) {
          if (!cls.chapter_id) {
            issues.push({ type: 'missing_parent', entity: 'class', id: cls.id, message: `Class "${cls.title}" has no chapter_id`, severity: 'error' });
          }
        }
      }
    }

    logger.debug('hierarchyValidator.validateBatchHierarchy', { batchId, issues: issues.length });
    return makeReport(issues);
  },

  async validateFullHierarchy(): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    const { data: subjects } = await supabase.from('subjects').select('id, batch_id, title');
    for (const subject of subjects ?? []) {
      if (subject.batch_id) {
        const { data: batch } = await supabase.from('batches').select('id').eq('id', subject.batch_id).maybeSingle();
        if (!batch) {
          issues.push({ type: 'orphaned_subject', entity: 'subject', id: subject.id, message: `Subject "${subject.title}" references non-existent batch ${subject.batch_id}`, severity: 'error' });
        }
      } else {
        issues.push({ type: 'missing_parent', entity: 'subject', id: subject.id, message: `Subject "${subject.title}" has no batch_id`, severity: 'error' });
      }
    }

    const { data: chapters } = await supabase.from('chapters').select('id, subject_id, title');
    for (const chapter of chapters ?? []) {
      if (chapter.subject_id) {
        const { data: subject } = await supabase.from('subjects').select('id').eq('id', chapter.subject_id).maybeSingle();
        if (!subject) {
          issues.push({ type: 'orphaned_chapter', entity: 'chapter', id: chapter.id, message: `Chapter "${chapter.title}" references non-existent subject ${chapter.subject_id}`, severity: 'error' });
        }
      } else {
        issues.push({ type: 'missing_parent', entity: 'chapter', id: chapter.id, message: `Chapter "${chapter.title}" has no subject_id`, severity: 'error' });
      }
    }

    const { data: classes } = await supabase.from('classes').select('id, chapter_id, title');
    for (const cls of classes ?? []) {
      if (cls.chapter_id) {
        const { data: chapter } = await supabase.from('chapters').select('id').eq('id', cls.chapter_id).maybeSingle();
        if (!chapter) {
          issues.push({ type: 'orphaned_class', entity: 'class', id: cls.id, message: `Class "${cls.title}" references non-existent chapter ${cls.chapter_id}`, severity: 'error' });
        }
      } else {
        issues.push({ type: 'missing_parent', entity: 'class', id: cls.id, message: `Class "${cls.title}" has no chapter_id`, severity: 'error' });
      }
    }

    return makeReport(issues);
  },
};
