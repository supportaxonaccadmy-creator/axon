import { memo } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { INSIGHT_TYPE_LABELS, INSIGHT_SEVERITY_COLORS } from '@/services/ai';
import type { LearningInsight } from '@/services/ai';

interface AiAssistantProps {
  insights: LearningInsight[];
  learningScore?: number | undefined;
  className?: string | undefined;
}

function AiAssistantComponent({ insights, learningScore, className }: AiAssistantProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'strength': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'weakness': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'prediction': return <Target className="h-4 w-4 text-purple-500" />;
      default: return <Sparkles className="h-4 w-4 text-primary-500" />;
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {learningScore !== undefined && (
        <Card hover>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Sparkles className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{learningScore.toFixed(1)}</p>
              <p className="text-xs text-neutral-500">AI Learning Score</p>
            </div>
          </CardContent>
        </Card>
      )}
      {insights.slice(0, 5).map((insight) => (
        <Card key={insight.id} hover>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(insight.type)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-neutral-900">{insight.title}</h3>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', INSIGHT_SEVERITY_COLORS[insight.severity])}>
                    {INSIGHT_TYPE_LABELS[insight.type]}
                  </span>
                </div>
                {insight.description && <p className="mt-1 text-xs text-neutral-500">{insight.description}</p>}
                {insight.actionableAdvice && (
                  <p className="mt-2 rounded-md bg-primary-50 px-2 py-1.5 text-xs text-primary-700">
                    <Lightbulb className="mr-1 inline h-3 w-3" />{insight.actionableAdvice}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {insights.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-neutral-500">No AI insights yet. Start studying to get personalized recommendations!</CardContent></Card>
      )}
    </div>
  );
}

export const AiAssistant = memo(AiAssistantComponent);
