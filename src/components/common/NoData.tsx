import { cn } from '@/utils/cn';

export interface NoDataProps {
  message?: string;
  className?: string;
}

export function NoData({ message = 'No data available', className }: NoDataProps) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  );
}
