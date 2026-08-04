import { useEffect, useCallback } from 'react';
import { metaService } from '@/services/seo';
import type { SEOMeta } from '@/services/seo';

export function useMetaTags() {
  const setMeta = useCallback((meta: SEOMeta) => { metaService.applyMeta(meta); }, []);
  const setTitle = useCallback((title: string) => { metaService.setTitle(title); }, []);
  const setDescription = useCallback((description: string) => { metaService.setMetaTag('description', description); }, []);
  const setKeywords = useCallback((keywords: string) => { metaService.setMetaTag('keywords', keywords); }, []);
  const setRobots = useCallback((content: string) => { metaService.setMetaTag('robots', content); }, []);
  const setNoindex = useCallback(() => { metaService.setMetaTag('robots', 'noindex, nofollow'); }, []);
  useEffect(() => { return () => { metaService.removeMeta('description'); metaService.removeMeta('keywords'); metaService.removeMeta('robots'); }; }, []);
  return { setMeta, setTitle, setDescription, setKeywords, setRobots, setNoindex };
}
