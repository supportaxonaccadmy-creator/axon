import { memo, useState, useMemo } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

interface VideoPreviewProps {
  youtubeUrl?: string | null;
  videoUrl?: string | null;
  thumbnail?: string | null;
  title?: string;
  compact?: boolean;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1] ?? null;
  }
  return null;
}

function VideoPreviewComponent({ youtubeUrl, videoUrl, thumbnail, title, compact = false }: VideoPreviewProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = useMemo(() => youtubeUrl ? extractYouTubeId(youtubeUrl) : null, [youtubeUrl]);
  const thumbSrc = useMemo(() => {
    if (thumbnail) return thumbnail;
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return null;
  }, [thumbnail, videoId]);

  if (compact) {
    return (
      <>
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          {thumbSrc ? <img src={thumbSrc} alt={title ?? 'Video'} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Play className="h-6 w-6 text-neutral-300" /></div>}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/40">
            <button onClick={() => setPlaying(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md transition-transform hover:scale-110" aria-label="Play video"><Play className="h-4 w-4 text-neutral-900" /></button>
          </div>
        </div>
        {playing && (videoId || videoUrl) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPlaying(false)}>
            <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setPlaying(false)} className="absolute -top-10 right-0 text-white hover:text-neutral-300" aria-label="Close"><X className="h-6 w-6" /></button>
              {videoId ? (
                <iframe src={`https://www.youtube.com/embed/${videoId}`} title={title ?? 'Video'} className="aspect-video w-full rounded-lg" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : videoUrl ? (
                <video src={videoUrl} controls className="aspect-video w-full rounded-lg" />
              ) : null}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="relative aspect-video bg-neutral-100">
        {playing && (videoId || videoUrl) ? (
          videoId ? (
            <iframe src={`https://www.youtube.com/embed/${videoId}`} title={title ?? 'Video'} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : videoUrl ? (
            <video src={videoUrl} controls autoPlay className="h-full w-full" />
          ) : null
        ) : (
          <>
            {thumbSrc ? <img src={thumbSrc} alt={title ?? 'Video'} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Play className="h-12 w-12 text-neutral-300" /></div>}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/40">
              <button onClick={() => setPlaying(true)} disabled={!videoId && !videoUrl} className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110 disabled:opacity-50" aria-label="Play video"><Play className="h-6 w-6 text-neutral-900" /></button>
            </div>
          </>
        )}
      </div>
      {youtubeUrl && (
        <div className="flex items-center justify-between p-3">
          <span className="truncate text-xs text-neutral-500">{youtubeUrl}</span>
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-600 hover:underline"><ExternalLink className="h-3 w-3" />Open</a>
        </div>
      )}
    </div>
  );
}

export const VideoPreview = memo(VideoPreviewComponent);
export { extractYouTubeId };
