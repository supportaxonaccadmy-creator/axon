import { useState, useRef, useCallback, useEffect } from 'react';
import type { PlaybackSpeed } from '@/services/video';

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: PlaybackSpeed;
  isFullscreen: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

export function useVideoPlayer(videoUrl: string | null) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackSpeed: 1,
    isFullscreen: false,
    isBuffering: false,
    hasError: false,
    errorMessage: null,
  });

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      setState((s) => ({ ...s, hasError: true, errorMessage: 'Failed to play video' }));
    });
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) play();
    else pause();
  }, [play, pause]);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setState((s) => ({ ...s, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = volume === 0;
    setState((s) => ({ ...s, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setState((s) => ({ ...s, isMuted: video.muted }));
  }, []);

  const setPlaybackSpeed = useCallback((speed: PlaybackSpeed) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setState((s) => ({ ...s, playbackSpeed: speed }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen();
    }
  }, []);

  const seekToStart = useCallback(() => seek(0), [seek]);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    seek(Math.max(0, Math.min(video.duration || 0, video.currentTime + delta)));
  }, [seek]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const onTimeUpdate = () => setState((s) => ({ ...s, currentTime: video.currentTime }));
    const onDurationChange = () => setState((s) => ({ ...s, duration: video.duration || 0 }));
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    const onWaiting = () => setState((s) => ({ ...s, isBuffering: true }));
    const onPlaying = () => setState((s) => ({ ...s, isBuffering: false }));
    const onError = () => setState((s) => ({ ...s, hasError: true, errorMessage: 'Video playback error', isBuffering: false }));
    const onFullscreenChange = () => setState((s) => ({ ...s, isFullscreen: !!document.fullscreenElement }));

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [videoUrl]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': seekBy(-5); break;
        case 'ArrowRight': seekBy(5); break;
        case 'ArrowUp': setVolume(Math.min(1, state.volume + 0.1)); break;
        case 'ArrowDown': setVolume(Math.max(0, state.volume - 0.1)); break;
        case 'f': toggleFullscreen(); break;
        case 'm': toggleMute(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlay, seekBy, setVolume, toggleFullscreen, toggleMute, state.volume]);

  return { videoRef, state, play, pause, togglePlay, seek, seekBy, seekToStart, setVolume, toggleMute, setPlaybackSpeed, toggleFullscreen };
}
