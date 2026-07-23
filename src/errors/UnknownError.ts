import { ApplicationError } from './ApplicationError';
import type { ErrorContext } from '@/types/errors';

export class UnknownError extends ApplicationError {
  readonly type = 'unknown' as const;
  readonly code = 'UNKNOWN_ERROR';

  constructor(
    message: string = 'An unknown error occurred',
    options?: { context?: ErrorContext | undefined; cause?: unknown },
  ) {
    super(message, { context: options?.context, cause: options?.cause });
  }
}
