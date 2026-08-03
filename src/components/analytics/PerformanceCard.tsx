import { memo } from 'react';
import { cn } from '@/utils/cn';

interface PerformanceCardProps { learningScore: number; engagementScore: number; consistencyScore: number; mcqAccuracy: number; completionPercentage: number; }

function PerformanceCardComponent({ learningScore, engagementScore, consistencyScore, mcqAccuracy, completionPercentage }: PerformanceCardProps) {
  const metrics = [
    { label: 'Learning Score', value: learningScore, color: 'text-primary-600' },
    { label: 'Engagement', value: engagementScore, color: 'text-success-600' },
    { label: 'Consistency', value: consistencyScore, color: 'text-accent-600' },
    { label: 'MCQ Accuracy', value: mcqAccuracy, color: 'text-warning-600' },
    { label: 'Completion', value: completionPercentage, color: 'text-primary-500' },
  ];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-neutral-900">Performance Overview</h3>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label}><div className="mb-1 flex items-center justify-between"><span className="text-xs font-medium text-neutral-600">{m.label}</span><span className={cn('text-sm font-bold', m.color)}>{m.value.toFixed(1)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className={cn('h-full rounded-full transition-all', m.color.replace('text-', 'bg-'))} style={{ width: `${Math.min(m.value, 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
export const PerformanceCard = memo(PerformanceCardComponent);
