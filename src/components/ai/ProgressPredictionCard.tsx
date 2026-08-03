import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { getScoreColor } from '@/services/ai';
import type { PerformancePrediction } from '@/services/ai';

interface ProgressPredictionCardProps {
  prediction: PerformancePrediction | null;
  className?: string | undefined;
}

function ProgressPredictionCardComponent({ prediction, className }: ProgressPredictionCardProps) {
  if (!prediction) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <TrendingUp className="h-8 w-8 text-neutral-300" />
          <p className="mt-2 text-sm text-neutral-500">No prediction available yet</p>
        </CardContent>
      </Card>
    );
  }

  const trendIcon = prediction.trend === 'improving' ? <TrendingUp className="h-4 w-4 text-green-500" /> : prediction.trend === 'declining' ? <TrendingDown className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4 text-neutral-400" />;
  const trendColor = prediction.trend === 'improving' ? 'text-green-600' : prediction.trend === 'declining' ? 'text-red-600' : 'text-neutral-500';

  return (
    <Card hover className={className}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <TrendingUp className="h-4 w-4 text-primary-500" /> Performance Prediction
          </h3>
          <span className={cn('flex items-center gap-1 text-xs font-medium capitalize', trendColor)}>
            {trendIcon} {prediction.trend}
          </span>
        </div>
        <div className="mb-3 flex items-center justify-between rounded-lg bg-neutral-50 p-3">
          <div>
            <p className="text-xs text-neutral-400">Predicted Score</p>
            <p className={cn('text-2xl font-bold', getScoreColor(prediction.predictedScore))}>{prediction.predictedScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-400">Confidence</p>
            <p className="text-lg font-bold text-neutral-700">{prediction.confidence.toFixed(0)}%</p>
          </div>
        </div>
        {prediction.factors.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-neutral-500">Key Factors</p>
            <div className="flex flex-wrap gap-1.5">
              {prediction.factors.map((factor, i) => (
                <span key={i} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">{factor}</span>
              ))}
            </div>
          </div>
        )}
        <p className="rounded-md bg-primary-50 px-3 py-2 text-xs text-primary-700">{prediction.recommendation}</p>
      </CardContent>
    </Card>
  );
}

export const ProgressPredictionCard = memo(ProgressPredictionCardComponent);
