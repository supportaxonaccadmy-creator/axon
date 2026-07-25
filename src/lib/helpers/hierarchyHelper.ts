import type { Batch, Subject, Chapter, Class } from '@/types/lms';

export interface HierarchyPath {
  batch?: Batch | undefined;
  subject?: Subject | undefined;
  chapter?: Chapter | undefined;
  class?: Class | undefined;
}

export interface HierarchyNode {
  id: string;
  type: 'batch' | 'subject' | 'chapter' | 'class';
  parentId: string | null;
  title: string;
  slug: string;
  children: HierarchyNode[];
}

export function buildHierarchyPath(
  batch: Batch,
  subject?: Subject,
  chapter?: Chapter,
  cls?: Class,
): HierarchyPath {
  return { batch, subject, chapter, class: cls };
}

export function buildHierarchyTree(
  batches: Batch[],
  subjects: Subject[],
  chapters: Chapter[],
  classes: Class[],
): HierarchyNode[] {
  return batches.map((batch) => ({
    id: batch.id,
    type: 'batch' as const,
    parentId: null,
    title: batch.title,
    slug: batch.slug,
    children: subjects
      .filter((s) => s.batchId === batch.id)
      .map((subject) => ({
        id: subject.id,
        type: 'subject' as const,
        parentId: batch.id,
        title: subject.title,
        slug: subject.slug,
        children: chapters
          .filter((c) => c.subjectId === subject.id)
          .map((chapter) => ({
            id: chapter.id,
            type: 'chapter' as const,
            parentId: subject.id,
            title: chapter.title,
            slug: chapter.slug,
            children: classes
              .filter((cl) => cl.chapterId === chapter.id)
              .map((cls) => ({
                id: cls.id,
                type: 'class' as const,
                parentId: chapter.id,
                title: cls.title,
                slug: cls.slug,
                children: [],
              })),
          })),
      })),
  }));
}

export function findNodeInHierarchy(
  tree: HierarchyNode[],
  id: string,
): HierarchyNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const child = findNodeInHierarchy(node.children, id);
    if (child) return child;
  }
  return null;
}
