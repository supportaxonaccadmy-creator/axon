import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface StudentDashboardGridProps { children: ReactNode; cols?: 1 | 2 | 3 | 4 | undefined; className?: string | undefined; }

const colsMap: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' };

export function StudentDashboardGrid({ children, cols = 3, className }: StudentDashboardGridProps) {
  return <div className={cn('grid gap-4', colsMap[cols], className)}>{children}</div>;
}
