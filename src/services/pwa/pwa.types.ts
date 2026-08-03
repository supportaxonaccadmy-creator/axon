export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate';

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface OfflineQueueItem {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
}

export interface NetworkState {
  online: boolean;
  effectiveType?: string | undefined;
  downlink?: number | undefined;
  rtt?: number | undefined;
}

export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

export interface PWAMetrics {
  loadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cacheHitRate: number;
  bundleSize: number;
}

export interface InstallPromptEvent {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface VersionInfo {
  version: string;
  buildNumber: string;
  buildDate: string;
  gitHash: string;
}

export interface BackgroundSyncTask {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  createdAt: number;
  lastAttemptAt: number | null;
  retryCount: number;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  current: string | null;
  percentage: number;
}
