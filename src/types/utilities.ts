export interface Deferred<T = unknown> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffFactor: number;
  shouldRetry?: (error: unknown) => boolean;
}

export interface ThrottleOptions {
  leading: boolean;
  trailing: boolean;
}

export interface DebounceOptions {
  leading: boolean;
  trailing: boolean;
}

export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
