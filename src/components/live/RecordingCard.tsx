import { memo } from 'react';
import { Play, Download, Clock, PlayCircle, Video, FileVideo } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';

void PlayCircle;
import { RECORDING_SOURCE_LABELS, formatDuration, formatRelativeTime } from '@/services/live';
import type { LiveRecording, RecordingSource } from '@/services/live';

const SOURCE_ICONS: Record<RecordingSource, typeof PlayCircle> = {
  youtube: PlayCircle,
  vimeo: Video,
  supabase_storage: FileVideo,
  external_url: Link2,
};

import { Link2 } from 'lucide-react';

interface RecordingCardProps {
  recording: LiveRecording;
  onPlay?: ((recording: LiveRecording) => void) | undefined;
  onDownload?: ((recording: LiveRecording) => void) | undefined;
  onDelete?: (id: string) => void;
  className?: string | undefined;
}

function RecordingCardComponent({ recording, onPlay, onDownload, onDelete, className }: RecordingCardProps) {
  const Icon = SOURCE_ICONS[recording.source] ?? Link2;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md', className)}>
      {recording.thumbnailUrl && (
        <div className="relative h-36 overflow-hidden bg-neutral-100">
          <img src={recording.thumbnailUrl} alt={recording.title} className="h-full w-full object-cover" />
          {onPlay && (
            <button
              onClick={() => onPlay(recording)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
              aria-label="Play recording"
            >
              <Play className="h-10 w-10 text-white" fill="white" />
            </button>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-4 w-4 text-neutral-400" />
          <Badge variant="info">{RECORDING_SOURCE_LABELS[recording.source]}</Badge>
        </div>

        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1">{recording.title}</h3>
        {recording.description && (
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{recording.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          {recording.durationSeconds && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDuration(recording.durationSeconds)}
            </span>
          )}
          <span>{formatRelativeTime(recording.createdAt)}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
          {onPlay && !recording.thumbnailUrl && (
            <button
              onClick={() => onPlay(recording)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary-600 transition-colors hover:bg-primary-50"
            >
              <Play className="h-3 w-3" /> Play
            </button>
          )}
          {onDownload && recording.downloadUrl && (
            <button
              onClick={() => onDownload(recording)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              <Download className="h-3 w-3" /> Download
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(recording.id)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-error-500 transition-colors hover:bg-error-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const RecordingCard = memo(RecordingCardComponent);
