import { useState, useCallback } from 'react';
import { errorTrackingService } from '@/services/monitoring';
import type { ErrorEntry } from '@/services/monitoring';

export function useErrorTracking() {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const refresh = useCallback(() => { setErrors(errorTrackingService.getErrors(true, 50)); }, []);
  const resolveError = useCallback((id: string) => { errorTrackingService.resolveError(id); setErrors(errorTrackingService.getErrors(true, 50)); }, []);
  const stats = errorTrackingService.getErrorStats();
  const errorsByModule = errorTrackingService.getErrorsByModule();
  return { errors, stats, errorsByModule, refresh, resolveError };
}
