import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '@/types/common';
import { cn } from '@/utils/cn';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link to={item.href} className="text-neutral-500 transition-colors hover:text-primary-600">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? 'font-medium text-neutral-900' : 'text-neutral-500')}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
