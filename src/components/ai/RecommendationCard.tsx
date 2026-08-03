import { memo } from 'react';
import { Video, FileText, HelpCircle, Radio, BookOpen, RotateCw, X, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { RECOMMENDATION_TYPE_LABELS, RECOMMENDATION_PRIORITY_COLORS } from '@/services/ai';
import type { LearningRecommendation } from '@/services/ai';

interface RecommendationCardProps {
  recommendation: LearningRecommendation;
  onDismiss?: ((id: string) => void | undefined) | undefined;
  onComplete?: ((id: string) => void | undefined) | undefined;
  onClick?: ((recommendation: LearningRecommendation) => void | undefined) | undefined;
  className?: string | undefined;
}

function RecommendationCardComponent({ recommendation, onDismiss, onComplete, onClick, className }: RecommendationCardProps) {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'mcq': return <HelpCircle className="h-4 w-4" />;
      case 'live_class': return <Radio className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'revision': return <RotateCw className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Card hover className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">{getIcon()}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">{recommendation.title}</h3>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', RECOMMENDATION_PRIORITY_COLORS[recommendation.priority])}>
                {RECOMMENDATION_TYPE_LABELS[recommendation.type]}
              </span>
            </div>
            {recommendation.description && <p className="mt-1 text-xs text-neutral-500">{recommendation.description}</p>}
            {recommendation.reason && <p className="mt-1.5 text-[11px] text-neutral-400 italic">Why: {recommendation.reason}</p>}
            <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-2">
              {onClick && (
                <button onClick={() => onClick(recommendation)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary-600 hover:bg-primary-50">
                  Start <ArrowRight className="h-3 w-3" />
                </button>
              )}
              {onComplete && (
                <button onClick={() => onComplete(recommendation.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-green-600 hover:bg-green-50">
                  <Check className="h-3 w-3" /> Done
                </button>
              )}
              {onDismiss && (
                <button onClick={() => onDismiss(recommendation.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-100">
                  <X className="h-3 w-3" /> Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const RecommendationCard = memo(RecommendationCardComponent);
