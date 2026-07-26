import { memo } from 'react';
import { TrendingUp, Award, BookOpen, Clock, Target } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StudentProgress } from '@/types/studentDashboard';

interface ProgressCardProps { progress: StudentProgress; }

const ITEMS = [
  { key: 'purchasedBatches', label: 'Purchased Batches', icon: BookOpen, color: 'primary' as const },
  { key: 'completedClasses', label: 'Completed Classes', icon: Award, color: 'success' as const },
  { key: 'completionPercent', label: 'Completion %', icon: Target, color: 'accent' as const, suffix: '%' },
  { key: 'mcqAttempted', label: 'MCQs Attempted', icon: TrendingUp, color: 'primary' as const },
  { key: 'averageScore', label: 'Average Score', icon: Award, color: 'success' as const, suffix: '%' },
  { key: 'studyTimeHours', label: 'Study Time (hrs)', icon: Clock, color: 'warning' as const },
] as const;

const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
  primary: { bg: 'bg-primary-50', icon: 'text-primary-600', text: 'text-primary-700' },
  success: { bg: 'bg-success-50', icon: 'text-success-600', text: 'text-success-700' },
  warning: { bg: 'bg-warning-50', icon: 'text-warning-600', text: 'text-warning-700' },
  accent: { bg: 'bg-accent-50', icon: 'text-accent-600', text: 'text-accent-700' },
};

function ProgressCardComponent({ progress }: ProgressCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ITEMS.map((item) => {
        const value = progress[item.key as keyof StudentProgress];
        const colors = colorMap[item.color]!;
        const Icon = item.icon;
        return (
          <div key={item.key} className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colors.bg)}><Icon className={cn('h-4 w-4', colors.icon)} strokeWidth={2} /></div>
            <div><p className="text-xl font-bold text-neutral-900 tracking-tight">{value}{'suffix' in item && item.suffix ? item.suffix : ''}</p><p className="text-xs font-medium text-neutral-500">{item.label}</p></div>
          </div>
        );
      })}
    </div>
  );
}

export const ProgressCard = memo(ProgressCardComponent);
