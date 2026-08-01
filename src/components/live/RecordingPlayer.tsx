import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { PlayCircle, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';
import type { LiveRecording } from '@/services/live';
import { formatDuration } from '@/services/live';

interface RecordingPlayerProps {
  recording: LiveRecording;
  onClose?: () => void;
  className?: string | undefined;
}

function RecordingPlayerComponent({ recording, onClose, className }: RecordingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [recording.url]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((v: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    video.muted = v === 0;
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void container.requestFullscreen();
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn('overflow-hidden rounded-xl bg-black', className)}>
      <div className="relative">
        <video
          ref={videoRef}
          src={recording.url}
          poster={recording.thumbnailUrl ?? undefined}
          className="h-full w-full"
          onClick={togglePlay}
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            aria-label="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-2 bg-neutral-900 p-3">
        <div className="flex items-center justify-between text-sm text-white">
          <span className="font-medium">{recording.title}</span>
          <span className="text-xs text-neutral-400">{formatDuration(currentTime)} / {formatDuration(duration)}</span>
        </div>

        <div
          className="relative h-1.5 cursor-pointer rounded-full bg-neutral-700"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seek(pct * duration);
          }}
        >
          <div className="absolute left-0 top-0 h-full rounded-full bg-primary-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={togglePlay} className="text-white hover:text-primary-400" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
          </button>
          <button type="button" onClick={toggleMute} className="text-white hover:text-primary-400" aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="h-1 w-20 cursor-pointer accent-primary-500"
          />
          <button type="button" onClick={toggleFullscreen} className="ml-auto text-white hover:text-primary-400" aria-label="Fullscreen">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const RecordingPlayer = memo(RecordingPlayerComponent);