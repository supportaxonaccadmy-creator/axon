import { ApplicationError } from './ApplicationError';
import type { ErrorContext } from '@/types/errors';

export class NotFoundError extends ApplicationError {
  readonly type = 'not_found' as const;
  readonly code = 'NOT_FOUND_ERROR';

  constructor(
    message: string = 'Resource not found',
    options?: { context?: ErrorContext | undefined; cause?: unknown },
  ) {
    super(message, { status: 404, context: options?.context, cause: options?.cause });
  }
}
