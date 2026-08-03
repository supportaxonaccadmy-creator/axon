import { memo } from 'react';
import { User, Mail } from 'lucide-react';
import { cn } from '@/utils/cn';
import { RETENTION_STATUS_LABELS, CHURN_RISK_LABELS } from '@/services/analytics';
import type { StudentIntelligence } from '@/services/analytics';

interface StudentInsightCardProps { insight: StudentIntelligence; onClick?: (studentId: string) => void; }
const riskColors: Record<string, string> = { low: 'bg-success-50 text-success-700', medium: 'bg-warning-50 text-warning-700', high: 'bg-error-50 text-error-700', critical: 'bg-error-100 text-error-800' };

function StudentInsightCardComponent({ insight, onClick }: StudentInsightCardProps) {
  return (
    <div className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md" onClick={() => onClick?.(insight.studentId)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(insight.studentId); }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50"><User className="h-5 w-5 text-primary-600" /></div>
          <div><h3 className="text-sm font-semibold text-neutral-900">{insight.fullName}</h3><p className="flex items-center gap-1 text-xs text-neutral-400"><Mail className="h-3 w-3" />{insight.email}</p></div>
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', riskColors[insight.churnRiskLevel])}>{CHURN_RISK_LABELS[insight.churnRiskLevel]}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-primary-50 p-2 text-center"><p className="text-lg font-bold text-primary-700">{insight.learningScore.toFixed(0)}</p><p className="text-[10px] text-neutral-500">Learning</p></div>
        <div className="rounded-lg bg-success-50 p-2 text-center"><p className="text-lg font-bold text-success-700">{insight.engagementScore.toFixed(0)}</p><p className="text-[10px] text-neutral-500">Engagement</p></div>
        <div className="rounded-lg bg-warning-50 p-2 text-center"><p className="text-lg font-bold text-warning-700">{insight.dropRisk.toFixed(0)}%</p><p className="text-[10px] text-neutral-500">Drop Risk</p></div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs"><span className="text-neutral-500">{RETENTION_STATUS_LABELS[insight.retentionStatus]}</span>{insight.predictedScore > 0 && <span className="font-medium text-neutral-700">Predicted: {insight.predictedScore.toFixed(0)}%</span>}</div>
    </div>
  );
}
export const StudentInsightCard = memo(StudentInsightCardComponent);
