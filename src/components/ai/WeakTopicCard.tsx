import { memo } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { RECOMMENDATION_PRIORITY_COLORS } from '@/services/ai';
import type { WeakTopic } from '@/services/ai';

interface WeakTopicCardProps {
  topic: WeakTopic;
  onResolve?: ((id: string) => void | undefined) | undefined;
  className?: string | undefined;
}

function WeakTopicCardComponent({ topic, onResolve, className }: WeakTopicCardProps) {
  return (
    <Card hover className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', topic.severity === 'urgent' ? 'bg-red-50' : topic.severity === 'high' ? 'bg-orange-50' : 'bg-yellow-50')}>
            <AlertTriangle className={cn('h-4 w-4', topic.severity === 'urgent' ? 'text-red-500' : topic.severity === 'high' ? 'text-orange-500' : 'text-yellow-500')} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">{topic.topicName}</h3>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', RECOMMENDATION_PRIORITY_COLORS[topic.severity])}>
                {topic.severity}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-neutral-400">Accuracy</p><p className="font-medium text-neutral-700">{topic.accuracyPercentage.toFixed(0)}%</p></div>
              <div><p className="text-neutral-400">Attempts</p><p className="font-medium text-neutral-700">{topic.attemptCount}</p></div>
              <div><p className="text-neutral-400">Correct</p><p className="font-medium text-neutral-700">{topic.correctCount}</p></div>
            </div>
            {topic.suggestedActions.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-[11px] font-medium text-neutral-500">Suggested Actions:</p>
                {topic.suggestedActions.slice(0, 3).map((action, i) => (
                  <p key={i} className="text-[11px] text-neutral-400">• {action}</p>
                ))}
              </div>
            )}
            {onResolve && !topic.isResolved && (
              <button onClick={() => onResolve(topic.id)} className="mt-3 flex items-center gap-1 rounded-md px-2 py-1 text-xs text-green-600 hover:bg-green-50">
                <Check className="h-3 w-3" /> Mark Resolved
              </button>
            )}
            {topic.isResolved && <p className="mt-2 text-xs text-green-600">Resolved</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const WeakTopicCard = memo(WeakTopicCardComponent);
