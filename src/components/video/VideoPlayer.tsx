import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { VideoControls } from './VideoControls';
import { VideoSkeleton } from './VideoSkeleton';
import { videoStreamingService } from '@/services/video';

interface VideoPlayerProps {
  videoUrl: string | null;
  videoId: string | null;
  studentId: string | null;
  videoDuration: number;
  className?: string | undefined;
  onWatchSessionEnd?: ((sessionDuration: number) => void) | undefined;
  autoPlay?: boolean | undefined;
}

export function VideoPlayer({
  videoUrl, videoId, studentId, videoDuration,
  className, onWatchSessionEnd, autoPlay = false,
}: VideoPlayerProps) {
  const { videoRef, state, togglePlay, seek, setVolume, toggleMute, setPlaybackSpeed, toggleFullscreen } = useVideoPlayer(videoUrl);
  const { updatePosition, addWatchedSeconds, startAutoSave, stopAutoSave, lastPosition } = useVideoProgress(studentId, videoId, videoDuration);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [denialReason, setDenialReason] = useState<string | null>(null);
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const controlsTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null)[0];

  const fetchSecureUrl = useCallback(async () => {
    if (!studentId || !videoId) {
      if (videoUrl) { setSecureUrl(videoUrl); setLoading(false); }
      else { setError('No video source'); setLoading(false); }
      return;
    }

    setLoading(true);
    const result = await videoStreamingService.getSecureVideoUrl(studentId, videoId);
    if (result.accessDenied) {
      setAccessDenied(true);
      setDenialReason(result.denialReason);
      setLoading(false);
      return;
    }
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setSecureUrl(result.url);
    setLoading(false);
  }, [studentId, videoId, videoUrl]);

  useEffect(() => { void fetchSecureUrl(); }, [fetchSecureUrl]);

  useEffect(() => {
    if (state.currentTime > 0) {
      updatePosition(state.currentTime);
      addWatchedSeconds(1);
    }
  }, [state.currentTime, updatePosition, addWatchedSeconds]);

  useEffect(() => {
    if (state.isPlaying) {
      startAutoSave();
      if (sessionStart === null) setSessionStart(Date.now());
    } else {
      stopAutoSave();
    }
  }, [state.isPlaying, startAutoSave, stopAutoSave, sessionStart]);

  useEffect(() => {
    if (state.duration > 0 && state.currentTime >= state.duration * 0.9) {
      void videoStreamingService.saveProgress(studentId ?? '', {
        videoId: videoId ?? '',
        watchedSeconds: state.currentTime,
        lastPositionSeconds: state.currentTime,
        completedPercentage: 100,
        isCompleted: true,
      });
    }
  }, [state.currentTime, state.duration, studentId, videoId]);

  const handleMouseMovement = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef) clearTimeout(controlsTimeoutRef);
    if (state.isPlaying) {
      setTimeout(() => setShowControls(false), 3000);
    }
  }, [controlsTimeoutRef, state.isPlaying]);

  if (loading) return <VideoSkeleton />;

  if (accessDenied) {
    return (
      <div className={cn('flex aspect-video flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-900 text-center', className)}>
        <AlertCircle className="h-12 w-12 text-neutral-500" />
        <p className="mt-3 max-w-xs text-sm font-medium text-white/80">{denialReason ?? 'Access denied'}</p>
        <p className="mt-1 text-xs text-white/40">Purchase this batch to access this class</p>
      </div>
    );
  }

  if (error || !secureUrl) {
    return (
      <div className={cn('flex aspect-video flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-900', className)}>
        <AlertCircle className="h-12 w-12 text-error-400" />
        <p className="mt-3 text-sm text-white/60">{error ?? 'Unable to load video'}</p>
      </div>
    );
  }

  const isYouTube = secureUrl.includes('youtube.com') || secureUrl.includes('youtu.be');

  if (isYouTube) {
    const embedUrl = secureUrl.includes('watch?v=')
      ? secureUrl.replace('watch?v=', 'embed/')
      : secureUrl.replace('youtu.be/', 'youtube.com/embed/');
    return (
      <div className={cn('aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-black', className)}>
        <iframe src={embedUrl} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video player" />
      </div>
    );
  }

  return (
    <div
      className={cn('group relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-black', className)}
      onMouseMove={handleMouseMovement}
      onMouseLeave={() => state.isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={secureUrl}
        className="h-full w-full"
        autoPlay={autoPlay}
        playsInline
        onClick={togglePlay}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          if (lastPosition > 0 && lastPosition < video.duration) {
            video.currentTime = lastPosition;
          }
        }}
      >
        Your browser does not support video playback.
      </video>

      {state.isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/60" />
        </div>
      )}

      {showControls && (
        <VideoControls
          state={state}
          onTogglePlay={togglePlay}
          onSeek={seek}
          onVolume={setVolume}
          onToggleMute={toggleMute}
          onPlaybackSpeed={setPlaybackSpeed}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {onWatchSessionEnd && sessionStart !== null && (
        <span className="hidden" data-session-start={sessionStart} data-current-time={state.currentTime} />
      )}
    </div>
  );
}
