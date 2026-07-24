import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-base font-semibold text-neutral-800">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
