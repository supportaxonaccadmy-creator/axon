import { useEffect } from 'react';
import { seoService, metaService, canonicalService } from '@/services/seo';
import type { SEOMeta } from '@/services/seo';

export function useSEO(meta: SEOMeta) {
  useEffect(() => {
    metaService.applyMeta(meta);
    if (meta.canonicalUrl) canonicalService.setCanonical(meta.canonicalUrl);
    return () => { if (meta.canonicalUrl) canonicalService.removeCanonical(); };
  }, [meta.title, meta.description, meta.canonicalUrl, meta.ogTitle, meta.ogImage, meta.robots, meta.noindex]);
}

export function usePageSEO(pageType: 'home' | 'blog' | 'course' | 'landing' | 'default', params?: Record<string, string>) {
  useEffect(() => {
    let meta: SEOMeta;
    switch (pageType) {
      case 'home': meta = seoService.getDefaultMeta(); break;
      case 'course': meta = seoService.generateCourseMeta(params?.name ?? 'Course', params?.type ?? 'Nursing', params?.description ?? ''); break;
      case 'blog': meta = seoService.generateBlogMeta(params?.title ?? 'Blog', params?.excerpt ?? '', params?.slug ?? 'blog'); break;
      case 'landing': meta = seoService.generateLandingPageMeta(params?.name ?? 'Exam', params?.description ?? ''); break;
      default: meta = seoService.getDefaultMeta(); break;
    }
    metaService.applyMeta(meta);
    if (meta.canonicalUrl) canonicalService.setCanonical(meta.canonicalUrl);
    return () => { canonicalService.removeCanonical(); };
  }, [pageType, params?.name, params?.title, params?.slug, params?.description, params?.excerpt]);
}
