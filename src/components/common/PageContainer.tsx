import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { cn } from '@/utils/cn';

export interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function PageContainer({ title, description, actions, children, size = 'xl', className }: PageContainerProps) {
  return (
    <Container size={size} className={cn('py-8', className)}>
      {(title || description || actions) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>}
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Container>
  );
}
