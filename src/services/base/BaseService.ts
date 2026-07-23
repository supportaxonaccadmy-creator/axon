import { logger } from '@/lib/logger';
import type { ApiError as ApiErrorType } from '@/types/api';
import { ApiError } from '@/errors/ApiError';
import { isApiError } from '@/types/api';

export abstract class BaseService {
  protected logger = logger;

  protected handleError(error: unknown): never {
    if (isApiError(error)) {
      throw new ApiError(error.message, { code: error.code, status: error.status });
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, { cause: error });
    }
    throw new ApiError('An unknown error occurred');
  }

  protected assertRequired<T>(value: T | null | undefined, field: string): T {
    if (value === null || value === undefined) {
      throw new ApiError(`${field} is required`, { code: 'VALIDATION_ERROR', status: 400 });
    }
    return value;
  }

  protected wrapResult<T>(data: T): { success: true; value: T } {
    return { success: true, value: data };
  }

  protected wrapError(error: unknown): { success: false; error: ApiErrorType } {
    const apiError = error instanceof ApiError ? error : new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
    );
    return { success: false, error: apiError.serialize() as unknown as ApiErrorType };
  }
}
