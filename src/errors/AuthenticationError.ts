import { ApplicationError } from './ApplicationError';
import type { ErrorContext } from '@/types/errors';

export class AuthenticationError extends ApplicationError {
  readonly type = 'authentication' as const;
  readonly code = 'AUTHENTICATION_ERROR';

  constructor(
    message: string = 'Authentication required',
    options?: { context?: ErrorContext | undefined; cause?: unknown },
  ) {
    super(message, { status: 401, context: options?.context, cause: options?.cause });
  }
}
