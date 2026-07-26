import { BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyDashboardProps { title?: string | undefined; description?: string | undefined; actionLabel?: string | undefined; onAction?: (() => void) | undefined; }

export function EmptyDashboard({ title = 'No content yet', description = 'Your dashboard will populate as you enroll in batches and start learning.', actionLabel, onAction }: EmptyDashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100"><BookOpen className="h-7 w-7 text-primary-600" strokeWidth={1.5} /></div>
      <div><p className="text-base font-semibold text-neutral-800">{title}</p><p className="mt-1 text-sm text-neutral-500 max-w-sm mx-auto">{description}</p></div>
      {actionLabel && onAction && <Button variant="primary" size="sm" onClick={onAction}><Sparkles className="mr-1.5 h-3.5 w-3.5" />{actionLabel}</Button>}
    </div>
  );
}
