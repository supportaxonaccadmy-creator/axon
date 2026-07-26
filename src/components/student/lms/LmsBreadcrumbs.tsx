import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ChevronRight, ArrowLeft } from 'lucide-react';
import type { BreadcrumbItem } from '@/services/lms/hierarchyService';
import { ROUTES } from '@/constants/routes';

interface LmsBreadcrumbsProps { items: BreadcrumbItem[]; showBack?: boolean; }

const TYPE_ROUTE: Record<string, (slug: string) => string> = {
  batch: (slug) => `/student/batches/${slug}`,
  subject: (slug) => `/student/subjects/${slug}`,
  chapter: (slug) => `/student/chapters/${slug}`,
  class: (slug) => `/student/classes/${slug}`,
};

function LmsBreadcrumbsComponent({ items, showBack = true }: LmsBreadcrumbsProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3">
      {showBack && items.length > 1 && <button onClick={() => navigate(-1)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700" aria-label="Go back"><ArrowLeft className="h-4 w-4" /></button>}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link to={ROUTES.STUDENT} className="flex items-center text-neutral-400 transition-colors hover:text-neutral-700" aria-label="Dashboard"><Home className="h-3.5 w-3.5" /></Link>
        {items.map((item, i) => { const isLast = i === items.length - 1; const href = TYPE_ROUTE[item.type]?.(item.slug) ?? '#'; return <span key={`${item.type}-${item.id}`} className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-neutral-300" />{isLast ? <span className="font-medium text-neutral-800">{item.title}</span> : <Link to={href} className="text-neutral-400 transition-colors hover:text-neutral-700">{item.title}</Link>}</span>; })}
      </nav>
    </div>
  );
}

export const LmsBreadcrumbs = memo(LmsBreadcrumbsComponent);
