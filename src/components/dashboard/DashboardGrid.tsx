import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DashboardGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | undefined;
  className?: string | undefined;
}

const colsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export function DashboardGrid({ children, cols = 3, className }: DashboardGridProps) {
  return <div className={cn('grid gap-4', colsMap[cols], className)}>{children}</div>;
}
