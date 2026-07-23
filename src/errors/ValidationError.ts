import { ApplicationError } from './ApplicationError';
import type { ErrorContext } from '@/types/errors';

export class ValidationError extends ApplicationError {
  readonly type = 'validation' as const;
  readonly code = 'VALIDATION_ERROR';
  readonly field: string | undefined;

  constructor(
    message: string,
    options?: { field?: string | undefined; context?: ErrorContext | undefined; cause?: unknown },
  ) {
    super(message, { context: options?.context, cause: options?.cause });
    this.field = options?.field;
  }
}
