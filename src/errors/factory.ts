import type { ErrorType, ErrorContext } from '@/types/errors';
import { ApplicationError } from './ApplicationError';
import { ValidationError } from './ValidationError';
import { ApiError } from './ApiError';
import { AuthenticationError } from './AuthenticationError';
import { AuthorizationError } from './AuthorizationError';
import { NotFoundError } from './NotFoundError';
import { UnknownError } from './UnknownError';

type ErrorFactoryOptions = {
  status?: number | undefined;
  code?: string | undefined;
  field?: string | undefined;
  context?: ErrorContext | undefined;
  cause?: unknown;
};

export function createError(type: ErrorType, message: string, options?: ErrorFactoryOptions): ApplicationError {
  switch (type) {
    case 'validation':
      return new ValidationError(message, { field: options?.field, context: options?.context, cause: options?.cause });
    case 'api':
      return new ApiError(message, { code: options?.code, status: options?.status, context: options?.context, cause: options?.cause });
    case 'authentication':
      return new AuthenticationError(message, { context: options?.context, cause: options?.cause });
    case 'authorization':
      return new AuthorizationError(message, { context: options?.context, cause: options?.cause });
    case 'not_found':
      return new NotFoundError(message, { context: options?.context, cause: options?.cause });
    case 'unknown':
    default:
      return new UnknownError(message, { context: options?.context, cause: options?.cause });
  }
}

export function fromError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) return error;
  if (error instanceof Error) return new UnknownError(error.message, { cause: error });
  if (typeof error === 'string') return new UnknownError(error);
  return new UnknownError('An unknown error occurred');
}
