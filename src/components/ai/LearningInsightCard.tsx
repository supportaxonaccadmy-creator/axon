import { memo } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { INSIGHT_TYPE_LABELS, INSIGHT_SEVERITY_COLORS } from '@/services/ai';
import type { LearningInsight } from '@/services/ai';

interface LearningInsightCardProps {
  insight: LearningInsight;
  onMarkRead?: ((id: string) => void | undefined) | undefined;
  className?: string | undefined;
}

function LearningInsightCardComponent({ insight, onMarkRead, className }: LearningInsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'strength': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'weakness': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'prediction': return <Target className="h-4 w-4 text-purple-500" />;
      default: return <Sparkles className="h-4 w-4 text-primary-500" />;
    }
  };

  return (
    <Card hover className={cn(!insight.isRead && 'ring-1 ring-primary-100', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getIcon()}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">{insight.title}</h3>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', INSIGHT_SEVERITY_COLORS[insight.severity])}>
                {INSIGHT_TYPE_LABELS[insight.type]}
              </span>
              {!insight.isRead && <span className="h-2 w-2 rounded-full bg-primary-500" />}
            </div>
            {insight.description && <p className="mt-1 text-xs text-neutral-500">{insight.description}</p>}
            {insight.actionableAdvice && (
              <p className="mt-2 rounded-md bg-primary-50 px-2 py-1.5 text-xs text-primary-700">
                <Lightbulb className="mr-1 inline h-3 w-3" />{insight.actionableAdvice}
              </p>
            )}
            {onMarkRead && !insight.isRead && (
              <button onClick={() => onMarkRead(insight.id)} className="mt-2 text-xs text-primary-600 hover:underline">Mark as read</button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const LearningInsightCard = memo(LearningInsightCardComponent);
