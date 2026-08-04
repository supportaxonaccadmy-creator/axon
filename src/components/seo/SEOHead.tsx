import { memo, type ReactNode } from 'react';
import { useSEO } from '@/hooks/useSEO';
import type { SEOMeta } from '@/services/seo';

interface SEOHeadProps { meta: SEOMeta; children?: ReactNode; }

function SEOHeadComponent({ meta, children }: SEOHeadProps) { useSEO(meta); return <>{children}</>; }
export const SEOHead = memo(SEOHeadComponent);
