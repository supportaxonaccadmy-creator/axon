export { videoStreamingService } from './video.service';
export {
  formatDuration, formatWatchTime, calculateCompletionPercentage,
  isVideoCompleted, getDeviceInfo, PLAYBACK_SPEEDS,
  PROGRESS_SAVE_INTERVAL_MS, COMPLETION_THRESHOLD, SIGNED_URL_EXPIRY_SECONDS,
} from './video.helpers';
export type { PlaybackSpeed } from './video.helpers';
export type {
  VideoStatus, VideoWithFile, VideoProgress, VideoWatchHistoryEntry,
  ContinueWatchingItem, VideoAnalytics, SaveProgressInput, WatchSessionInput,
  SecureVideoUrlResult, VideoAccessResult,
} from './video.types';
