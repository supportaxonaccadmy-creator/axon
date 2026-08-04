import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStructuredData } from '@/hooks/useStructuredData';

interface BreadcrumbSEOProps { items: { name: string; path: string }[]; }

function BreadcrumbSEOComponent({ items }: BreadcrumbSEOProps) {
  const { injectBreadcrumb } = useStructuredData();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nursinglms.com';
  useEffect(() => { injectBreadcrumb(items.map((item) => ({ name: item.name, url: `${baseUrl}${item.path}` }))); }, [items, baseUrl, injectBreadcrumb]);
  return (<nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-neutral-500">{items.map((item, index) => (<span key={item.path} className="flex items-center gap-2">{index > 0 && <span className="text-neutral-300">/</span>}{index === items.length - 1 ? <span className="font-medium text-neutral-700" aria-current="page">{item.name}</span> : <Link to={item.path} className="hover:text-primary-600">{item.name}</Link>}</span>))}</nav>);
}
export const BreadcrumbSEO = memo(BreadcrumbSEOComponent);
