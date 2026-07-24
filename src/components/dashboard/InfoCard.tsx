import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InfoCardProps {
  title: string;
  icon?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}

export function InfoCard({ title, icon, children, className }: InfoCardProps) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-5 shadow-sm', className)}>
      <div className="mb-3 flex items-center gap-2">
        {icon && <span className="text-neutral-500">{icon}</span>}
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}
