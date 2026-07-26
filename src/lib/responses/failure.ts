import type { FailurePayload, PayloadError } from '@/types/response';

export function failure(code: string, message: string, details?: Record<string, string>): FailurePayload {
  return { success: false, data: null, error: { code, message, details: details ?? null }, meta: null };
}

export function buildError(code: string, message: string, details?: Record<string, string>): PayloadError { return { code, message, details: details ?? null }; }
export function isFailure(response: unknown): response is FailurePayload { return typeof response === 'object' && response !== null && 'success' in response && response.success === false; }
