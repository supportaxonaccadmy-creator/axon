import { ApplicationError } from './ApplicationError';
import type { ErrorContext } from '@/types/errors';

export class AuthorizationError extends ApplicationError {
  readonly type = 'authorization' as const;
  readonly code = 'AUTHORIZATION_ERROR';

  constructor(
    message: string = 'Access denied',
    options?: { context?: ErrorContext | undefined; cause?: unknown },
  ) {
    super(message, { status: 403, context: options?.context, cause: options?.cause });
  }
}
