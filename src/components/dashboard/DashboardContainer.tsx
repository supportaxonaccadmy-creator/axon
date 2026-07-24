import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DashboardContainerProps {
  children: ReactNode;
  className?: string | undefined;
}

export function DashboardContainer({ children, className }: DashboardContainerProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}
