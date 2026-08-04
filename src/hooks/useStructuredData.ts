import { useEffect, useCallback } from 'react';
import { schemaService } from '@/services/seo';
import type { SchemaType } from '@/services/seo';

export function useStructuredData() {
  const injectSchema = useCallback((schema: SchemaType, id?: string) => { schemaService.injectSchema(schema, id); }, []);
  const injectOrganization = useCallback(() => { schemaService.injectSchema(schemaService.organization(), 'schema-organization'); }, []);
  const injectWebsite = useCallback(() => { schemaService.injectSchema(schemaService.website(), 'schema-website'); }, []);
  const injectBreadcrumb = useCallback((items: { name: string; url: string }[]) => { schemaService.injectSchema(schemaService.breadcrumb(items), 'schema-breadcrumb'); }, []);
  const injectFAQ = useCallback((faqs: { question: string; answer: string }[]) => { schemaService.injectSchema(schemaService.faq(faqs), 'schema-faq'); }, []);
  const injectArticle = useCallback((headline: string, description: string, author: string, datePublished: string, image?: string, url?: string) => { schemaService.injectSchema(schemaService.article(headline, description, author, datePublished, image, url), 'schema-article'); }, []);
  const injectCourse = useCallback((name: string, description: string, provider: string, url?: string) => { schemaService.injectSchema(schemaService.course(name, description, provider, url), 'schema-course'); }, []);
  const injectVideo = useCallback((name: string, description: string, thumbnailUrl: string, uploadDate: string, contentUrl?: string) => { schemaService.injectSchema(schemaService.video(name, description, thumbnailUrl, uploadDate, contentUrl), 'schema-video'); }, []);
  const removeSchema = useCallback((id: string) => { schemaService.removeSchema(id); }, []);
  useEffect(() => { return () => { schemaService.removeSchema('schema-organization'); schemaService.removeSchema('schema-website'); schemaService.removeSchema('schema-breadcrumb'); schemaService.removeSchema('schema-faq'); schemaService.removeSchema('schema-article'); schemaService.removeSchema('schema-course'); schemaService.removeSchema('schema-video'); }; }, []);
  return { injectSchema, injectOrganization, injectWebsite, injectBreadcrumb, injectFAQ, injectArticle, injectCourse, injectVideo, removeSchema };
}
