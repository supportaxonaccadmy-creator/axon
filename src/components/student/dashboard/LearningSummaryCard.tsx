import { memo } from 'react';
import { TrendingUp, BookOpen, Award, Clock, Target, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { LearningSummary } from '@/services/student/enhancedStudentDashboardService';

interface LearningSummaryCardProps { summary: LearningSummary | null; }

function LearningSummaryCardComponent({ summary }: LearningSummaryCardProps) {
  const items = [
    { label: 'Batches', value: summary?.totalBatches ?? 0, icon: BookOpen, color: 'text-primary-600 bg-primary-50' },
    { label: 'Classes Done', value: summary?.completedClasses ?? 0, icon: Award, color: 'text-success-600 bg-success-50' },
    { label: 'Total Classes', value: summary?.totalClasses ?? 0, icon: Target, color: 'text-accent-600 bg-accent-50' },
    { label: 'Progress', value: `${summary?.overallProgress ?? 0}%`, icon: TrendingUp, color: 'text-primary-600 bg-primary-50' },
    { label: 'This Week', value: `${summary?.studyTimeThisWeek ?? 0}h`, icon: Clock, color: 'text-warning-600 bg-warning-50' },
    { label: 'MCQs', value: summary?.mcqAttemptsThisWeek ?? 0, icon: HelpCircle, color: 'text-success-600 bg-success-50' },
  ];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Learning Summary</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => { const Icon = item.icon; return (
          <div key={item.label} className="flex items-center gap-2.5 rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50"><div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', item.color)}><Icon className="h-4 w-4" strokeWidth={2} /></div><div><p className="text-base font-bold text-neutral-900">{item.value}</p><p className="text-[10px] text-neutral-500">{item.label}</p></div></div>
        ); })}
      </div>
    </div>
  );
}

export const LearningSummaryCard = memo(LearningSummaryCardComponent);
