import { ApplicationError } from './ApplicationError';
import type { ErrorContext } from '@/types/errors';

export class ApiError extends ApplicationError {
  readonly type = 'api' as const;
  readonly code: string;

  constructor(
    message: string,
    options?: { code?: string | undefined; status?: number | undefined; context?: ErrorContext | undefined; cause?: unknown },
  ) {
    super(message, { status: options?.status, context: options?.context, cause: options?.cause });
    this.code = options?.code ?? 'API_ERROR';
  }
}
