import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DashboardSectionProps {
  title?: string | undefined;
  description?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
  action?: ReactNode | undefined;
}

export function DashboardSection({ title, description, children, className, action }: DashboardSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-neutral-800">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
