import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DashboardCardProps {
  children: ReactNode;
  className?: string | undefined;
}

export function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md', className)}>
      {children}
    </div>
  );
}
