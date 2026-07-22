import { useEffect } from 'react';
import { APP_CONFIG } from '@/constants/app';

export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_CONFIG.name}` : APP_CONFIG.name;
  }, [title]);
}
