import type { SuccessPayload } from '@/types/response';

export function success<T>(data: T): SuccessPayload<T> { return { success: true, data, error: null, meta: null }; }
