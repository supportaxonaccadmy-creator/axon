import { memo } from 'react';
import { cn } from '@/utils/cn';

interface QualitySelectorProps {
  quality: string | null;
  available?: string[] | undefined;
  onChange?: (quality: string) => void;
}

function QualitySelectorComponent({ quality, available, onChange }: QualitySelectorProps) {
  const qualities = available ?? ['Auto', '1080p', '720p', '480p'];
  return (
    <div className="flex items-center gap-1">
      {qualities.map((q) => (
        <button
          key={q}
          onClick={() => onChange?.(q)}
          className={cn(
            'rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
            (quality ?? 'Auto') === q
              ? 'bg-primary-500 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          )}
        >
          {q}
        </button>
      ))}
    </div>
  );
}

export const QualitySelector = memo(QualitySelectorComponent);
