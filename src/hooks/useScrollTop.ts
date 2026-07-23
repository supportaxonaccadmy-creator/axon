import { useCallback } from 'react';
import { scrollToTop } from '@/utils/dom';

export function useScrollTop(): () => void {
  return useCallback(() => scrollToTop(true), []);
}
