import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  McqSet, McqSetInsert, McqSetUpdate, McqSetRow,
  McqQuestion, McqQuestionInsert, McqQuestionUpdate, McqQuestionRow,
  McqSetWithQuestions,
} from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const SETS_TABLE = 'mcq_sets';
const QUESTIONS_TABLE = 'mcq_questions';

function mapMcqSet(row: McqSetRow): McqSet {
  return {
    id: row.id, classId: row.class_id, title: row.title, slug: row.slug,
    description: row.description, instructions: row.instructions,
    durationMinutes: row.duration_minutes, totalMarks: row.total_marks,
    passingMarks: row.passing_marks, attemptsAllowed: row.attempts_allowed,
    shuffleQuestions: row.shuffle_questions, showResult: row.show_result,
    status: row.status, sortOrder: row.sort_order, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapMcqQuestion(row: McqQuestionRow): McqQuestion {
  return {
    id: row.id, mcqSetId: row.mcq_set_id, question: row.question,
    optionA: row.option_a, optionB: row.option_b, optionC: row.option_c, optionD: row.option_d,
    correctOption: row.correct_option, explanation: row.explanation,
    marks: row.marks, negativeMarks: Number(row.negative_marks),
    sortOrder: row.sort_order, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toSetRow(input: McqSetInsert): Record<string, unknown> {
  return {
    class_id: input.classId, title: input.title, slug: input.slug,
    description: input.description ?? null, instructions: input.instructions ?? null,
    duration_minutes: input.durationMinutes ?? null, total_marks: input.totalMarks ?? 0,
    passing_marks: input.passingMarks ?? 0, attempts_allowed: input.attemptsAllowed ?? null,
    shuffle_questions: input.shuffleQuestions ?? false, show_result: input.showResult ?? true,
    status: input.status ?? 'draft', sort_order: input.sortOrder ?? 0,
  };
}

function toSetUpdateRow(input: McqSetUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.classId !== undefined) row.class_id = input.classId;
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.instructions !== undefined) row.instructions = input.instructions;
  if (input.durationMinutes !== undefined) row.duration_minutes = input.durationMinutes;
  if (input.totalMarks !== undefined) row.total_marks = input.totalMarks;
  if (input.passingMarks !== undefined) row.passing_marks = input.passingMarks;
  if (input.attemptsAllowed !== undefined) row.attempts_allowed = input.attemptsAllowed;
  if (input.shuffleQuestions !== undefined) row.shuffle_questions = input.shuffleQuestions;
  if (input.showResult !== undefined) row.show_result = input.showResult;
  if (input.status !== undefined) row.status = input.status;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  return row;
}

function toQuestionRow(input: McqQuestionInsert): Record<string, unknown> {
  return {
    mcq_set_id: input.mcqSetId, question: input.question,
    option_a: input.optionA, option_b: input.optionB, option_c: input.optionC, option_d: input.optionD,
    correct_option: input.correctOption, explanation: input.explanation ?? null,
    marks: input.marks ?? 1, negative_marks: input.negativeMarks ?? 0,
    sort_order: input.sortOrder ?? 0, status: input.status ?? 'draft',
  };
}

function toQuestionUpdateRow(input: McqQuestionUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.mcqSetId !== undefined) row.mcq_set_id = input.mcqSetId;
  if (input.question !== undefined) row.question = input.question;
  if (input.optionA !== undefined) row.option_a = input.optionA;
  if (input.optionB !== undefined) row.option_b = input.optionB;
  if (input.optionC !== undefined) row.option_c = input.optionC;
  if (input.optionD !== undefined) row.option_d = input.optionD;
  if (input.correctOption !== undefined) row.correct_option = input.correctOption;
  if (input.explanation !== undefined) row.explanation = input.explanation;
  if (input.marks !== undefined) row.marks = input.marks;
  if (input.negativeMarks !== undefined) row.negative_marks = input.negativeMarks;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.status !== undefined) row.status = input.status;
  return row;
}

export interface McqSetListOptions {
  classId?: string | undefined;
  publishedOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
}

export const mcqService = {
  async getSetById(id: string): Promise<{ data: McqSet | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(SETS_TABLE).select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('mcqService.getSetById', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapMcqSet(data as McqSetRow) : null, error: null };
  },

  async getSetBySlug(classId: string, slug: string): Promise<{ data: McqSet | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(SETS_TABLE).select('*').eq('class_id', classId).eq('slug', slug).maybeSingle();
    if (error) { logger.error('mcqService.getSetBySlug', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapMcqSet(data as McqSetRow) : null, error: null };
  },

  async listSets(options?: McqSetListOptions): Promise<{ data: McqSet[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(SETS_TABLE).select('*');
    if (options?.classId) query = query.eq('class_id', options.classId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) { logger.error('mcqService.listSets', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as McqSetRow[]).map(mapMcqSet), error: null };
  },

  async paginateSets(page: number = 1, pageSize: number = 10, options?: McqSetListOptions): Promise<PaginatedResult<McqSet>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(SETS_TABLE).select('*', { count: 'exact', head: true });
    if (options?.classId) countQuery = countQuery.eq('class_id', options.classId);
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.search) countQuery = countQuery.ilike('title', `%${options.search}%`);
    const { count } = await countQuery;
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    let query = supabase.from(SETS_TABLE).select('*');
    if (options?.classId) query = query.eq('class_id', options.classId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await query;
    if (error) { logger.error('mcqService.paginateSets', { error: error.message }); return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false }; }
    return { data: (data as McqSetRow[]).map(mapMcqSet), total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },

  async createSet(input: McqSetInsert): Promise<{ data: McqSet | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(SETS_TABLE).insert(toSetRow(input)).select('*').maybeSingle();
    if (error) { logger.error('mcqService.createSet', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapMcqSet(data as McqSetRow) : null, error: null };
  },

  async updateSet(id: string, input: McqSetUpdate): Promise<{ data: McqSet | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(SETS_TABLE).update(toSetUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { logger.error('mcqService.updateSet', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapMcqSet(data as McqSetRow) : null, error: null };
  },

  async removeSet(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(SETS_TABLE).delete().eq('id', id);
    if (error) { logger.error('mcqService.removeSet', { error: error.message }); return { error: error.message }; }
    return { error: null };
  },

  async publishSet(id: string): Promise<{ data: McqSet | null; error: string | null }> {
    return this.updateSet(id, { status: 'published' });
  },

  async unpublishSet(id: string): Promise<{ data: McqSet | null; error: string | null }> {
    return this.updateSet(id, { status: 'draft' });
  },

  async updateSetSortOrder(id: string, sortOrder: number): Promise<{ data: McqSet | null; error: string | null }> {
    return this.updateSet(id, { sortOrder });
  },

  async getSetWithQuestions(id: string): Promise<{ data: McqSetWithQuestions | null; error: string | null }> {
    const { data: set, error: setError } = await this.getSetById(id);
    if (setError || !set) return { data: null, error: setError };
    const { data: questions, error: qError } = await this.listQuestions(id, { publishedOnly: false });
    if (qError) return { data: null, error: qError };
    return { data: { ...set, questions }, error: null };
  },

  async getQuestionById(id: string): Promise<{ data: McqQuestion | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(QUESTIONS_TABLE).select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('mcqService.getQuestionById', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapMcqQuestion(data as McqQuestionRow) : null, error: null };
  },

  async listQuestions(mcqSetId: string, options?: { publishedOnly?: boolean | undefined; sort?: SortOption | undefined; search?: string | undefined }): Promise<{ data: McqQuestion[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(QUESTIONS_TABLE).select('*').eq('mcq_set_id', mcqSetId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.search) query = query.ilike('question', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) { logger.error('mcqService.listQuestions', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as McqQuestionRow[]).map(mapMcqQuestion), error: null };
  },

  async createQuestion(input: McqQuestionInsert): Promise<{ data: McqQuestion | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(QUESTIONS_TABLE).insert(toQuestionRow(input)).select('*').maybeSingle();
    if (error) { logger.error('mcqService.createQuestion', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapMcqQuestion(data as McqQuestionRow) : null, error: null };
  },

  async updateQuestion(id: string, input: McqQuestionUpdate): Promise<{ data: McqQuestion | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(QUESTIONS_TABLE).update(toQuestionUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { logger.error('mcqService.updateQuestion', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapMcqQuestion(data as McqQuestionRow) : null, error: null };
  },

  async removeQuestion(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(QUESTIONS_TABLE).delete().eq('id', id);
    if (error) { logger.error('mcqService.removeQuestion', { error: error.message }); return { error: error.message }; }
    return { error: null };
  },

  async publishQuestion(id: string): Promise<{ data: McqQuestion | null; error: string | null }> {
    return this.updateQuestion(id, { status: 'published' });
  },

  async unpublishQuestion(id: string): Promise<{ data: McqQuestion | null; error: string | null }> {
    return this.updateQuestion(id, { status: 'draft' });
  },

  async updateQuestionSortOrder(id: string, sortOrder: number): Promise<{ data: McqQuestion | null; error: string | null }> {
    return this.updateQuestion(id, { sortOrder });
  },
};
