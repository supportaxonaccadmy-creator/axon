import { memo } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PlayCircle, Download, Clock, FileVideo } from 'lucide-react';
import type { LiveRecording } from '@/services/live';
import { RECORDING_SOURCE_LABELS, formatDuration, formatFileSize, formatDateTime } from '@/services/live';

interface RecordingCardProps {
  recording: LiveRecording;
  onPlay?: ((recording: LiveRecording) => void) | undefined;
  onDownload?: ((recording: LiveRecording) => void) | undefined;
  onDelete?: ((recording: LiveRecording) => void) | undefined;
  className?: string | undefined;
}

function RecordingCardComponent({ recording, onPlay, onDownload, onDelete, className }: RecordingCardProps) {
  return (
    <Card hover className={cn('overflow-hidden', className)}>
      <div className="relative aspect-video bg-neutral-100">
        {recording.thumbnailUrl ? (
          <img src={recording.thumbnailUrl} alt={recording.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileVideo className="h-12 w-12 text-neutral-300" />
          </div>
        )}
        {recording.durationSeconds && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {formatDuration(recording.durationSeconds)}
          </span>
        )}
        {onPlay && (
          <button
            type="button"
            onClick={() => onPlay(recording)}
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity hover:bg-black/20 hover:opacity-100"
            aria-label="Play recording"
          >
            <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
          </button>
        )}
      </div>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1">{recording.title}</h3>
          <Badge variant="default" className="shrink-0 text-xs">{RECORDING_SOURCE_LABELS[recording.source]}</Badge>
        </div>
        {recording.description && <p className="text-xs text-neutral-500 line-clamp-2">{recording.description}</p>}
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDateTime(recording.createdAt)}
          </span>
          {recording.fileSizeBytes && (
            <span>{formatFileSize(recording.fileSizeBytes)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onPlay && (
            <Button size="sm" variant="primary" onClick={() => onPlay(recording)}>
              <PlayCircle className="h-3.5 w-3.5" />
              Play
            </Button>
          )}
          {onDownload && recording.downloadUrl && (
            <Button size="sm" variant="outline" onClick={() => onDownload(recording)}>
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(recording)}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const RecordingCard = memo(RecordingCardComponent);