import type { SchemaType } from './seo.types';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://nursinglms.com';
const SITE_NAME = 'Enterprise Nursing LMS';
const SITE_LOGO = `${SITE_URL}/logo.png`;

class SchemaService {
  organization(name?: string, url?: string, sameAs?: string[]): SchemaType { return { '@context': 'https://schema.org', '@type': 'Organization', name: name ?? SITE_NAME, url: url ?? SITE_URL, logo: { '@type': 'ImageObject', url: SITE_LOGO }, description: 'Enterprise Learning Management System for Nursing Education', sameAs: sameAs ?? [] }; }
  website(name?: string): SchemaType { return { '@context': 'https://schema.org', '@type': 'WebSite', name: name ?? SITE_NAME, url: SITE_URL, potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/blog?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }; }
  course(name: string, description: string, provider: string, url?: string): SchemaType { return { '@context': 'https://schema.org', '@type': 'Course', name, description, provider: { '@type': 'EducationalOrganization', name: provider, url: SITE_URL }, url: url ?? SITE_URL }; }
  educationalOrganization(name: string, description: string, url?: string): SchemaType { return { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name, description, url: url ?? SITE_URL, logo: SITE_LOGO }; }
  breadcrumb(items: { name: string; url: string }[]): SchemaType { return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.url })) }; }
  faq(faqs: { question: string; answer: string }[]): SchemaType { return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }; }
  article(headline: string, description: string, author: string, datePublished: string, image?: string, url?: string): SchemaType { return { '@context': 'https://schema.org', '@type': 'Article', headline, description, author: { '@type': 'Person', name: author }, publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: SITE_LOGO } }, datePublished, image: image ?? SITE_LOGO, mainEntityOfPage: { '@type': 'WebPage', '@id': url ?? SITE_URL } }; }
  video(name: string, description: string, thumbnailUrl: string, uploadDate: string, contentUrl?: string): SchemaType { return { '@context': 'https://schema.org', '@type': 'VideoObject', name, description, thumbnailUrl, uploadDate, contentUrl: contentUrl ?? `${SITE_URL}/video` }; }
  review(itemName: string, rating: number, author: string, body: string): SchemaType { return { '@context': 'https://schema.org', '@type': 'Review', itemReviewed: { '@type': 'Course', name: itemName }, reviewRating: { '@type': 'Rating', ratingValue: String(rating), bestRating: '5', worstRating: '1' }, author: { '@type': 'Person', name: author }, reviewBody: body }; }
  injectSchema(schema: SchemaType, id?: string): void { if (typeof document === 'undefined') return; const scriptId = id ?? `schema-${schema['@type']}`; const existing = document.getElementById(scriptId); if (existing) existing.remove(); const script = document.createElement('script'); script.type = 'application/ld+json'; script.id = scriptId; script.textContent = JSON.stringify(schema); document.head.appendChild(script); }
  removeSchema(id: string): void { if (typeof document === 'undefined') return; const script = document.getElementById(id); if (script) script.remove(); }
  injectMultiple(schemas: SchemaType[]): void { schemas.forEach((schema, i) => this.injectSchema(schema, `schema-${schema['@type']}-${i}`)); }
}

export const schemaService = new SchemaService();
