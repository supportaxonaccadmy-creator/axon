import { memo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { VideoProgress } from './VideoProgress';
import { PlaybackSpeedControl } from './PlaybackSpeed';
import type { VideoPlayerState } from '@/hooks/useVideoPlayer';
import type { PlaybackSpeed as PlaybackSpeedType } from '@/services/video';

interface VideoControlsProps {
  state: VideoPlayerState;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolume: (volume: number) => void;
  onToggleMute: () => void;
  onPlaybackSpeed: (speed: PlaybackSpeedType) => void;
  onToggleFullscreen: () => void;
}

function VideoControlsComponent({
  state, onTogglePlay, onSeek, onVolume, onToggleMute, onPlaybackSpeed, onToggleFullscreen,
}: VideoControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-6 transition-opacity">
      <VideoProgress current={state.currentTime} duration={state.duration} onSeek={onSeek} />

      <div className="flex items-center gap-2 px-3 pb-2">
        <button onClick={onTogglePlay} className="text-white hover:text-primary-400 transition-colors" aria-label={state.isPlaying ? 'Pause' : 'Play'}>
          {state.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-1">
          <button onClick={onToggleMute} className="text-white hover:text-primary-400 transition-colors" aria-label={state.isMuted ? 'Unmute' : 'Mute'}>
            {state.isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={state.isMuted ? 0 : state.volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            className="h-1 w-16 cursor-pointer accent-primary-500"
            aria-label="Volume"
          />
        </div>

        <div className="flex-1" />

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-white/50">Speed:</span>
          <PlaybackSpeedControl current={state.playbackSpeed} onChange={onPlaybackSpeed} />
        </div>

        <button onClick={onToggleFullscreen} className="text-white hover:text-primary-400 transition-colors" aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {state.isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export const VideoControls = memo(VideoControlsComponent);
