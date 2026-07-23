import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface ContentSectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ContentSection({ title, description, action, children, className }: ContentSectionProps) {
  return (
    <section className={cn('rounded-xl border border-neutral-200 bg-white p-6 shadow-sm', className)}>
      {(title || description || action) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
