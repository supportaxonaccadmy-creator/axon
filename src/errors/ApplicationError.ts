import type { ErrorType, ErrorContext, SerializedError } from '@/types/errors';

export abstract class ApplicationError extends Error {
  abstract readonly type: ErrorType;
  abstract readonly code: string;
  readonly status: number | undefined;
  readonly context: ErrorContext;
  readonly timestamp: string;

  constructor(
    message: string,
    options?: { status?: number | undefined; context?: ErrorContext | undefined; cause?: unknown },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = options?.status;
    this.context = options?.context ?? {};
    this.timestamp = new Date().toISOString();
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }

  serialize(): SerializedError {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.context,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}
