import { getSupabaseClient } from '@/lib/supabase';
import type { TransactionCallback } from '@/types/database';
import { logger } from '@/lib/logger';

export async function executeTransaction<T>(callback: TransactionCallback<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await callback();
    return { data: result, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transaction failed';
    logger.error('Transaction error', { error: message });
    return { data: null, error: message };
  }
}

export async function withRetry<T>(
  operation: () => Promise<{ data: T | null; error: string | null }>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
): Promise<{ data: T | null; error: string | null }> {
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await operation();
    if (!result.error) return result;

    lastError = result.error;
    logger.warn(`Database operation attempt ${attempt} failed`, { error: result.error });

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  return { data: null, error: lastError };
}

export async function rpc<T>(functionName: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await getSupabaseClient().rpc(functionName, args ?? {});
  return { data: data as T | null, error: error?.message ?? null };
}
