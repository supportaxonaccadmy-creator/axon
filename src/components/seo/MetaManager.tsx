import { memo, type ReactNode, useEffect } from 'react';
import { metaService, canonicalService, robotsService } from '@/services/seo';
import type { SEOMeta } from '@/services/seo';

interface MetaManagerProps { title: string; description: string; keywords?: string; canonicalPath?: string; ogImage?: string; ogType?: string; noindex?: boolean; children?: ReactNode; }

function MetaManagerComponent({ title, description, keywords, canonicalPath, ogImage, ogType, noindex, children }: MetaManagerProps) {
  useEffect(() => {
    const meta: SEOMeta = { title, description, ogTitle: title, ogDescription: description, ogType: ogType ?? 'website', twitterCard: 'summary_large_image', twitterTitle: title, twitterDescription: description, robots: noindex ? 'noindex, nofollow' : robotsService.getRobotsMeta() };
    if (keywords) meta.keywords = keywords;
    if (canonicalPath) meta.canonicalUrl = canonicalPath;
    if (ogImage) meta.ogImage = ogImage;
    if (noindex) meta.noindex = noindex;
    metaService.applyMeta(meta);
    if (canonicalPath) canonicalService.setCanonical(canonicalPath);
    return () => { canonicalService.removeCanonical(); };
  }, [title, description, keywords, canonicalPath, ogImage, ogType, noindex]);
  return <>{children}</>;
}
export const MetaManager = memo(MetaManagerComponent);
