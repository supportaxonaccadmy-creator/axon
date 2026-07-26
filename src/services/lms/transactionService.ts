import { logger } from '@/lib/logger';
import { batchService } from './batchService';
import { subjectService } from './subjectService';
import { chapterService } from './chapterService';
import { classService } from './classService';
import type {
  BatchInsert, SubjectInsert, ChapterInsert, ClassInsert,
  Batch, Subject, Chapter, Class,
} from '@/types/lms';

export interface CreateHierarchyInput {
  batch: BatchInsert;
  subjects: { subject: SubjectInsert; chapters: { chapter: ChapterInsert; classes: ClassInsert[] }[] }[];
}

export interface CreateHierarchyResult {
  batch: Batch | null;
  subjects: Subject[];
  chapters: Chapter[];
  classes: Class[];
  error: string | null;
}

export interface DeleteHierarchyResult {
  deleted: boolean;
  error: string | null;
}

export interface PublishHierarchyResult {
  published: boolean;
  error: string | null;
}

export interface ArchiveHierarchyResult {
  archived: boolean;
  error: string | null;
}

export const transactionService = {
  async createHierarchy(input: CreateHierarchyInput): Promise<CreateHierarchyResult> {
    const { data: batch, error: batchError } = await batchService.create(input.batch);
    if (batchError || !batch) {
      return { batch: null, subjects: [], chapters: [], classes: [], error: batchError ?? 'Failed to create batch' };
    }

    const subjects: Subject[] = [];
    const chapters: Chapter[] = [];
    const classes: Class[] = [];

    for (const subjectData of input.subjects) {
      const { data: subject, error: subjectError } = await subjectService.create({
        ...subjectData.subject,
        batchId: batch.id,
      });
      if (subjectError || !subject) {
        await this.rollbackCreateHierarchy(batch.id, subjects.map((s) => s.id), chapters.map((c) => c.id), classes.map((c) => c.id));
        return { batch, subjects, chapters, classes, error: subjectError ?? 'Failed to create subject' };
      }
      subjects.push(subject);

      for (const chapterData of subjectData.chapters) {
        const { data: chapter, error: chapterError } = await chapterService.create({
          ...chapterData.chapter,
          subjectId: subject.id,
        });
        if (chapterError || !chapter) {
          await this.rollbackCreateHierarchy(batch.id, subjects.map((s) => s.id), chapters.map((c) => c.id), classes.map((c) => c.id));
          return { batch, subjects, chapters, classes, error: chapterError ?? 'Failed to create chapter' };
        }
        chapters.push(chapter);

        for (const classInput of chapterData.classes) {
          const { data: cls, error: classError } = await classService.create({
            ...classInput,
            chapterId: chapter.id,
          });
          if (classError || !cls) {
            await this.rollbackCreateHierarchy(batch.id, subjects.map((s) => s.id), chapters.map((c) => c.id), classes.map((c) => c.id));
            return { batch, subjects, chapters, classes, error: classError ?? 'Failed to create class' };
          }
          classes.push(cls);
        }
      }
    }

    return { batch, subjects, chapters, classes, error: null };
  },

  async rollbackCreateHierarchy(batchId: string, subjectIds: string[], chapterIds: string[], classIds: string[]): Promise<void> {
    logger.warn('transactionService.rollbackCreateHierarchy', { batchId, subjectIds, chapterIds, classIds });
    try {
      for (const id of classIds) await classService.remove(id);
      for (const id of chapterIds) await chapterService.remove(id);
      for (const id of subjectIds) await subjectService.remove(id);
      await batchService.remove(batchId);
    } catch (err) {
      logger.error('transactionService.rollbackCreateHierarchy failed', { error: err instanceof Error ? err.message : String(err) });
    }
  },

  async deleteHierarchy(batchId: string): Promise<DeleteHierarchyResult> {
    const { error } = await batchService.remove(batchId);
    if (error) return { deleted: false, error };
    return { deleted: true, error: null };
  },

  async publishHierarchy(batchId: string): Promise<PublishHierarchyResult> {
    try {
      const { error: batchError } = await batchService.update(batchId, { status: 'published' });
      if (batchError) return { published: false, error: batchError };

      const { data: subjects } = await subjectService.list({ batchId });
      for (const subject of subjects) {
        await subjectService.update(subject.id, { status: 'published' });
        const { data: chapters } = await chapterService.list({ subjectId: subject.id });
        for (const chapter of chapters) {
          await chapterService.update(chapter.id, { status: 'published' });
          const { data: classes } = await classService.list({ chapterId: chapter.id });
          for (const cls of classes) {
            await classService.update(cls.id, { status: 'published' });
          }
        }
      }
      return { published: true, error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('transactionService.publishHierarchy', { error: msg });
      return { published: false, error: msg };
    }
  },

  async archiveHierarchy(batchId: string): Promise<ArchiveHierarchyResult> {
    try {
      const { error: batchError } = await batchService.update(batchId, { status: 'archived' });
      if (batchError) return { archived: false, error: batchError };

      const { data: subjects } = await subjectService.list({ batchId });
      for (const subject of subjects) {
        await subjectService.update(subject.id, { status: 'archived' });
        const { data: chapters } = await chapterService.list({ subjectId: subject.id });
        for (const chapter of chapters) {
          await chapterService.update(chapter.id, { status: 'archived' });
          const { data: classes } = await classService.list({ chapterId: chapter.id });
          for (const cls of classes) {
            await classService.update(cls.id, { status: 'archived' });
          }
        }
      }
      return { archived: true, error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('transactionService.archiveHierarchy', { error: msg });
      return { archived: false, error: msg };
    }
  },
};
