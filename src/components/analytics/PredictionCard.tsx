import { memo } from 'react';
import { Brain, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PREDICTION_TYPE_LABELS, PREDICTION_TREND_LABELS } from '@/services/analytics';
import type { StudentPrediction } from '@/services/analytics';

interface PredictionCardProps { prediction: StudentPrediction; }
const trendColors = { improving: 'text-success-600 bg-success-50', stable: 'text-neutral-600 bg-neutral-50', declining: 'text-error-600 bg-error-50' };

function PredictionCardComponent({ prediction }: PredictionCardProps) {
  const isRisk = prediction.predictionType === 'drop_risk';
  const Icon = isRisk ? AlertTriangle : Brain;
  const confidenceColor = prediction.confidence >= 75 ? 'text-success-600' : prediction.confidence >= 50 ? 'text-warning-600' : 'text-error-600';
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', isRisk ? 'bg-error-50' : 'bg-primary-50')}><Icon className={cn('h-4 w-4', isRisk ? 'text-error-600' : 'text-primary-600')} /></div><h3 className="text-sm font-semibold text-neutral-900">{PREDICTION_TYPE_LABELS[prediction.predictionType]}</h3></div>
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', trendColors[prediction.trend])}>{PREDICTION_TREND_LABELS[prediction.trend]}</span>
      </div>
      <div className="flex items-end justify-between">
        <div><p className="text-3xl font-bold text-neutral-900">{prediction.predictedValue.toFixed(1)}{prediction.predictionType === 'expected_rank' ? '' : '%'}</p><p className="mt-1 text-xs text-neutral-500">Predicted Value</p></div>
        <div className="text-right"><p className={cn('text-lg font-bold', confidenceColor)}>{prediction.confidence.toFixed(0)}%</p><p className="text-xs text-neutral-500">Confidence</p></div>
      </div>
      {prediction.notes && <p className="text-xs text-neutral-500">{prediction.notes}</p>}
    </div>
  );
}
export const PredictionCard = memo(PredictionCardComponent);
