import type { SerializedError } from '@/types/errors';
import { ApplicationError } from './ApplicationError';

export function formatError(error: unknown): string {
  if (error instanceof ApplicationError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export function serializeError(error: unknown): SerializedError {
  if (error instanceof ApplicationError) {
    return error.serialize();
  }
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message,
      code: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };
  }
  return {
    type: 'unknown',
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  };
}

export function toUserMessage(error: unknown): string {
  const formatted = formatError(error);
  return formatted || 'Something went wrong. Please try again.';
}
