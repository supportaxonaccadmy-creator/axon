import type { RetryOptions } from '@/types/utilities';

export async function retry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const delayMs = options?.delayMs ?? 1000;
  const backoffFactor = options?.backoffFactor ?? 2;
  const shouldRetry = options?.shouldRetry ?? (() => true);

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;

      if (attempt === maxRetries) break;
      if (!shouldRetry(err)) break;

      const waitMs = delayMs * Math.pow(backoffFactor, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
  backoffFactor: number = 2,
): Promise<T> {
  return retry(operation, {
    maxRetries,
    delayMs: initialDelayMs,
    backoffFactor,
  });
}
