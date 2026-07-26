import {
  validateTitle, validateSlug, validateStatus, validateSortOrder, validatePrice,
} from '@/lib/helpers/validationHelper';

export interface LmsValidationResult {
  valid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

function toResult(errors: string[], fieldErrors: Record<string, string>): LmsValidationResult {
  return { valid: errors.length === 0, errors, fieldErrors };
}

function addError(errors: string[], fieldErrors: Record<string, string>, field: string, error: string): void {
  errors.push(error);
  fieldErrors[field] = error;
}

export const validationService = {
  validateBatch(input: { title: unknown; slug: unknown; status?: unknown; sortOrder?: unknown; price?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    const titleErr = validateTitle(input.title);
    if (titleErr) addError(errors, fieldErrors, 'title', titleErr);
    const slugErr = validateSlug(input.slug);
    if (slugErr) addError(errors, fieldErrors, 'slug', slugErr);
    const statusErr = validateStatus(input.status);
    if (statusErr) addError(errors, fieldErrors, 'status', statusErr);
    const sortOrderErr = validateSortOrder(input.sortOrder);
    if (sortOrderErr) addError(errors, fieldErrors, 'sortOrder', sortOrderErr);
    const priceErr = validatePrice(input.price);
    if (priceErr) addError(errors, fieldErrors, 'price', priceErr);
    return toResult(errors, fieldErrors);
  },

  validateSubject(input: { batchId: unknown; title: unknown; slug: unknown; status?: unknown; sortOrder?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.batchId !== 'string' || input.batchId.trim().length === 0) {
      addError(errors, fieldErrors, 'batchId', 'Batch ID is required');
    }
    const titleErr = validateTitle(input.title);
    if (titleErr) addError(errors, fieldErrors, 'title', titleErr);
    const slugErr = validateSlug(input.slug);
    if (slugErr) addError(errors, fieldErrors, 'slug', slugErr);
    const statusErr = validateStatus(input.status);
    if (statusErr) addError(errors, fieldErrors, 'status', statusErr);
    const sortOrderErr = validateSortOrder(input.sortOrder);
    if (sortOrderErr) addError(errors, fieldErrors, 'sortOrder', sortOrderErr);
    return toResult(errors, fieldErrors);
  },

  validateChapter(input: { subjectId: unknown; title: unknown; slug: unknown; status?: unknown; sortOrder?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.subjectId !== 'string' || input.subjectId.trim().length === 0) {
      addError(errors, fieldErrors, 'subjectId', 'Subject ID is required');
    }
    const titleErr = validateTitle(input.title);
    if (titleErr) addError(errors, fieldErrors, 'title', titleErr);
    const slugErr = validateSlug(input.slug);
    if (slugErr) addError(errors, fieldErrors, 'slug', slugErr);
    const statusErr = validateStatus(input.status);
    if (statusErr) addError(errors, fieldErrors, 'status', statusErr);
    const sortOrderErr = validateSortOrder(input.sortOrder);
    if (sortOrderErr) addError(errors, fieldErrors, 'sortOrder', sortOrderErr);
    return toResult(errors, fieldErrors);
  },

  validateClass(input: { chapterId: unknown; title: unknown; slug: unknown; status?: unknown; sortOrder?: unknown; duration?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.chapterId !== 'string' || input.chapterId.trim().length === 0) {
      addError(errors, fieldErrors, 'chapterId', 'Chapter ID is required');
    }
    const titleErr = validateTitle(input.title);
    if (titleErr) addError(errors, fieldErrors, 'title', titleErr);
    const slugErr = validateSlug(input.slug);
    if (slugErr) addError(errors, fieldErrors, 'slug', slugErr);
    const statusErr = validateStatus(input.status);
    if (statusErr) addError(errors, fieldErrors, 'status', statusErr);
    const sortOrderErr = validateSortOrder(input.sortOrder);
    if (sortOrderErr) addError(errors, fieldErrors, 'sortOrder', sortOrderErr);
    if (input.duration !== undefined && input.duration !== null) {
      if (typeof input.duration !== 'number' || input.duration < 0) {
        addError(errors, fieldErrors, 'duration', 'Duration must be a non-negative number');
      }
    }
    return toResult(errors, fieldErrors);
  },

  validateVideo(input: { classId: unknown; title: unknown; slug: unknown; status?: unknown; sortOrder?: unknown; duration?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.classId !== 'string' || input.classId.trim().length === 0) {
      addError(errors, fieldErrors, 'classId', 'Class ID is required');
    }
    const titleErr = validateTitle(input.title);
    if (titleErr) addError(errors, fieldErrors, 'title', titleErr);
    const slugErr = validateSlug(input.slug);
    if (slugErr) addError(errors, fieldErrors, 'slug', slugErr);
    const statusErr = validateStatus(input.status);
    if (statusErr) addError(errors, fieldErrors, 'status', statusErr);
    const sortOrderErr = validateSortOrder(input.sortOrder);
    if (sortOrderErr) addError(errors, fieldErrors, 'sortOrder', sortOrderErr);
    if (input.duration !== undefined && input.duration !== null) {
      if (typeof input.duration !== 'number' || input.duration < 0) {
        addError(errors, fieldErrors, 'duration', 'Duration must be a non-negative number');
      }
    }
    return toResult(errors, fieldErrors);
  },

  validatePdf(input: { classId: unknown; title: unknown; slug: unknown; status?: unknown; sortOrder?: unknown; fileSize?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.classId !== 'string' || input.classId.trim().length === 0) {
      addError(errors, fieldErrors, 'classId', 'Class ID is required');
    }
    const titleErr = validateTitle(input.title);
    if (titleErr) addError(errors, fieldErrors, 'title', titleErr);
    const slugErr = validateSlug(input.slug);
    if (slugErr) addError(errors, fieldErrors, 'slug', slugErr);
    const statusErr = validateStatus(input.status);
    if (statusErr) addError(errors, fieldErrors, 'status', statusErr);
    const sortOrderErr = validateSortOrder(input.sortOrder);
    if (sortOrderErr) addError(errors, fieldErrors, 'sortOrder', sortOrderErr);
    if (input.fileSize !== undefined && input.fileSize !== null) {
      if (typeof input.fileSize !== 'number' || input.fileSize < 0) {
        addError(errors, fieldErrors, 'fileSize', 'File size must be a non-negative number');
      }
    }
    return toResult(errors, fieldErrors);
  },

  validateMcqSet(input: { classId: unknown; title: unknown; slug: unknown; status?: unknown; sortOrder?: unknown; totalMarks?: unknown; passingMarks?: unknown; durationMinutes?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.classId !== 'string' || input.classId.trim().length === 0) {
      addError(errors, fieldErrors, 'classId', 'Class ID is required');
    }
    const titleErr = validateTitle(input.title);
    if (titleErr) addError(errors, fieldErrors, 'title', titleErr);
    const slugErr = validateSlug(input.slug);
    if (slugErr) addError(errors, fieldErrors, 'slug', slugErr);
    const statusErr = validateStatus(input.status);
    if (statusErr) addError(errors, fieldErrors, 'status', statusErr);
    const sortOrderErr = validateSortOrder(input.sortOrder);
    if (sortOrderErr) addError(errors, fieldErrors, 'sortOrder', sortOrderErr);
    if (input.totalMarks !== undefined && (typeof input.totalMarks !== 'number' || input.totalMarks < 0)) {
      addError(errors, fieldErrors, 'totalMarks', 'Total marks must be a non-negative number');
    }
    if (input.passingMarks !== undefined && (typeof input.passingMarks !== 'number' || input.passingMarks < 0)) {
      addError(errors, fieldErrors, 'passingMarks', 'Passing marks must be a non-negative number');
    }
    if (input.passingMarks !== undefined && input.totalMarks !== undefined && typeof input.passingMarks === 'number' && typeof input.totalMarks === 'number' && input.passingMarks > input.totalMarks) {
      addError(errors, fieldErrors, 'passingMarks', 'Passing marks cannot exceed total marks');
    }
    if (input.durationMinutes !== undefined && input.durationMinutes !== null) {
      if (typeof input.durationMinutes !== 'number' || input.durationMinutes < 0) {
        addError(errors, fieldErrors, 'durationMinutes', 'Duration must be a non-negative number');
      }
    }
    return toResult(errors, fieldErrors);
  },

  validateMcqQuestion(input: { mcqSetId: unknown; question: unknown; optionA: unknown; optionB: unknown; optionC: unknown; optionD: unknown; correctOption: unknown; marks?: unknown; negativeMarks?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.mcqSetId !== 'string' || input.mcqSetId.trim().length === 0) {
      addError(errors, fieldErrors, 'mcqSetId', 'MCQ Set ID is required');
    }
    if (typeof input.question !== 'string' || input.question.trim().length === 0) {
      addError(errors, fieldErrors, 'question', 'Question is required');
    }
    if (typeof input.optionA !== 'string' || input.optionA.trim().length === 0) {
      addError(errors, fieldErrors, 'optionA', 'Option A is required');
    }
    if (typeof input.optionB !== 'string' || input.optionB.trim().length === 0) {
      addError(errors, fieldErrors, 'optionB', 'Option B is required');
    }
    if (typeof input.optionC !== 'string' || input.optionC.trim().length === 0) {
      addError(errors, fieldErrors, 'optionC', 'Option C is required');
    }
    if (typeof input.optionD !== 'string' || input.optionD.trim().length === 0) {
      addError(errors, fieldErrors, 'optionD', 'Option D is required');
    }
    if (!['a', 'b', 'c', 'd'].includes(input.correctOption as string)) {
      addError(errors, fieldErrors, 'correctOption', 'Correct option must be a, b, c, or d');
    }
    if (input.marks !== undefined && (typeof input.marks !== 'number' || input.marks < 0)) {
      addError(errors, fieldErrors, 'marks', 'Marks must be a non-negative number');
    }
    if (input.negativeMarks !== undefined && (typeof input.negativeMarks !== 'number' || input.negativeMarks < 0)) {
      addError(errors, fieldErrors, 'negativeMarks', 'Negative marks must be a non-negative number');
    }
    return toResult(errors, fieldErrors);
  },

  validatePricing(input: { batchId: unknown; price?: unknown; salePrice?: unknown; currency?: unknown; accessDurationDays?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.batchId !== 'string' || input.batchId.trim().length === 0) {
      addError(errors, fieldErrors, 'batchId', 'Batch ID is required');
    }
    const priceErr = validatePrice(input.price);
    if (priceErr) addError(errors, fieldErrors, 'price', priceErr);
    if (input.salePrice !== undefined && input.salePrice !== null) {
      if (typeof input.salePrice !== 'number' || input.salePrice < 0) {
        addError(errors, fieldErrors, 'salePrice', 'Sale price must be a non-negative number');
      } else if (typeof input.price === 'number' && input.salePrice >= input.price) {
        addError(errors, fieldErrors, 'salePrice', 'Sale price should be less than regular price');
      }
    }
    if (input.currency !== undefined && (typeof input.currency !== 'string' || input.currency.length !== 3)) {
      addError(errors, fieldErrors, 'currency', 'Currency must be a 3-letter code');
    }
    if (input.accessDurationDays !== undefined && input.accessDurationDays !== null) {
      if (typeof input.accessDurationDays !== 'number' || input.accessDurationDays < 0) {
        addError(errors, fieldErrors, 'accessDurationDays', 'Access duration must be a non-negative number');
      }
    }
    return toResult(errors, fieldErrors);
  },

  validatePurchase(input: { profileId: unknown; batchId: unknown; pricingId: unknown; amount: unknown; currency?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.profileId !== 'string' || input.profileId.trim().length === 0) {
      addError(errors, fieldErrors, 'profileId', 'Profile ID is required');
    }
    if (typeof input.batchId !== 'string' || input.batchId.trim().length === 0) {
      addError(errors, fieldErrors, 'batchId', 'Batch ID is required');
    }
    if (typeof input.pricingId !== 'string' || input.pricingId.trim().length === 0) {
      addError(errors, fieldErrors, 'pricingId', 'Pricing ID is required');
    }
    if (typeof input.amount !== 'number' || input.amount < 0) {
      addError(errors, fieldErrors, 'amount', 'Amount must be a non-negative number');
    }
    if (input.currency !== undefined && (typeof input.currency !== 'string' || input.currency.length !== 3)) {
      addError(errors, fieldErrors, 'currency', 'Currency must be a 3-letter code');
    }
    return toResult(errors, fieldErrors);
  },

  validateEnrollment(input: { profileId: unknown; batchId: unknown; pricingId: unknown; enrollmentType?: unknown; accessStatus?: unknown; expiresAt?: unknown }): LmsValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    if (typeof input.profileId !== 'string' || input.profileId.trim().length === 0) {
      addError(errors, fieldErrors, 'profileId', 'Profile ID is required');
    }
    if (typeof input.batchId !== 'string' || input.batchId.trim().length === 0) {
      addError(errors, fieldErrors, 'batchId', 'Batch ID is required');
    }
    if (typeof input.pricingId !== 'string' || input.pricingId.trim().length === 0) {
      addError(errors, fieldErrors, 'pricingId', 'Pricing ID is required');
    }
    if (input.enrollmentType !== undefined && !['purchase', 'admin', 'free'].includes(input.enrollmentType as string)) {
      addError(errors, fieldErrors, 'enrollmentType', 'Enrollment type must be purchase, admin, or free');
    }
    if (input.accessStatus !== undefined && !['active', 'expired', 'cancelled'].includes(input.accessStatus as string)) {
      addError(errors, fieldErrors, 'accessStatus', 'Access status must be active, expired, or cancelled');
    }
    if (input.expiresAt !== undefined && input.expiresAt !== null) {
      if (typeof input.expiresAt !== 'string' || isNaN(Date.parse(input.expiresAt))) {
        addError(errors, fieldErrors, 'expiresAt', 'Expiry date must be a valid ISO date string');
      }
    }
    return toResult(errors, fieldErrors);
  },
};
