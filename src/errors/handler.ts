import type { ErrorContext } from '@/types/errors';
import { serializeError } from './formatter';
import { fromError } from './factory';

type ErrorHandler = (error: unknown, context?: ErrorContext) => void;

let globalHandler: ErrorHandler | null = null;

export function setGlobalErrorHandler(handler: ErrorHandler): void {
  globalHandler = handler;
}

export function handleGlobalError(error: unknown, context?: ErrorContext): void {
  if (globalHandler) {
    globalHandler(error, context);
  } else {
    const serialized = serializeError(error);
    if (serialized.type !== 'unknown') {
      console.error(`[${serialized.type.toUpperCase()}] ${serialized.message}`, serialized);
    }
  }
}

export function handleAsyncError<T extends (...args: never[]) => unknown>(
  fn: T,
  context?: ErrorContext,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((e: unknown) => {
          handleGlobalError(fromError(e), context);
          return undefined as ReturnType<T>;
        }) as ReturnType<T>;
      }
      return result as ReturnType<T>;
    } catch (e) {
      handleGlobalError(fromError(e), context);
      return undefined;
    }
  };
}
