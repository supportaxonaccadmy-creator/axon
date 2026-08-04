import { memo, type ReactNode } from 'react';
import { useStructuredData } from '@/hooks/useStructuredData';
import type { SchemaType } from '@/services/seo';

interface StructuredDataProps { schema?: SchemaType; schemas?: SchemaType[]; type?: 'organization' | 'website' | 'breadcrumb' | 'faq' | 'article' | 'course' | 'video'; data?: unknown; children?: ReactNode; }

function StructuredDataComponent({ schema, schemas, type, data, children }: StructuredDataProps) {
  const { injectSchema, injectOrganization, injectWebsite, injectBreadcrumb, injectFAQ, injectArticle, injectCourse, injectVideo } = useStructuredData();
  if (schema) injectSchema(schema);
  if (schemas) schemas.forEach((s, i) => injectSchema(s, `schema-${s['@type']}-${i}`));
  if (type === 'organization') injectOrganization();
  if (type === 'website') injectWebsite();
  if (type === 'breadcrumb' && data && Array.isArray((data as { items?: unknown[] }).items)) injectBreadcrumb((data as { items: { name: string; url: string }[] }).items);
  if (type === 'faq' && data && Array.isArray((data as { faqs?: unknown[] }).faqs)) injectFAQ((data as { faqs: { question: string; answer: string }[] }).faqs);
  if (type === 'article' && data) { const d = data as { headline: string; description: string; author: string; datePublished: string; image?: string; url?: string }; injectArticle(d.headline, d.description, d.author, d.datePublished, d.image, d.url); }
  if (type === 'course' && data) { const d = data as { name: string; description: string; provider: string; url?: string }; injectCourse(d.name, d.description, d.provider, d.url); }
  if (type === 'video' && data) { const d = data as { name: string; description: string; thumbnailUrl: string; uploadDate: string; contentUrl?: string }; injectVideo(d.name, d.description, d.thumbnailUrl, d.uploadDate, d.contentUrl); }
  return <>{children}</>;
}
export const StructuredData = memo(StructuredDataComponent);
