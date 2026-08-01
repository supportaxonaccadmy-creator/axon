import { memo, useCallback } from 'react';
import { X } from 'lucide-react';
import type { LiveRecording } from '@/services/live';

interface RecordingPlayerProps {
  recording: LiveRecording | null;
  onClose: () => void;
}

function RecordingPlayerComponent({ recording, onClose }: RecordingPlayerProps) {
  if (!recording) return null;

  const isYouTube = useCallback((url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }, []);

  const getYouTubeEmbedUrl = useCallback((url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
          <h2 className="text-base font-semibold text-neutral-900">{recording.title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="aspect-video overflow-hidden rounded-b-xl">
          {isYouTube(recording.url) ? (
            <iframe
              src={getYouTubeEmbedUrl(recording.url)}
              title={recording.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : recording.source === 'external_url' ? (
            <iframe src={recording.url} title={recording.title} className="h-full w-full" allowFullScreen />
          ) : (
            <video src={recording.url} controls className="h-full w-full" />
          )}
        </div>
      </div>
    </div>
  );
}

export const RecordingPlayer = memo(RecordingPlayerComponent);
