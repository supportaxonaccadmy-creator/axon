export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentInfo {
  name: Environment;
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  apiUrl: string;
  appUrl: string;
  logLevel: string;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  enableDevTools: boolean;
}

export interface HealthStatus {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  message: string;
  timestamp: string;
  responseTime?: number;
}

export interface HealthCheckResult {
  component: string;
  healthy: boolean;
  status: HealthStatus['status'];
  message: string;
  responseTime: number;
  timestamp: string;
}

export interface DatabaseHealth {
  healthy: boolean;
  totalTables: number;
  totalIndexes: number;
  totalPolicies: number;
  connectionStatus: string;
  slowQueries: number;
  message: string;
}

export interface StorageHealth {
  healthy: boolean;
  totalBuckets: number;
  totalFiles: number;
  totalSizeBytes: number;
  message: string;
}

export interface BackupRecord {
  id: string;
  type: 'database' | 'storage' | 'full';
  status: 'completed' | 'failed' | 'in_progress';
  sizeBytes: number;
  startedAt: string;
  completedAt: string | null;
  message: string;
}

export interface DeploymentRecord {
  id: string;
  version: string;
  environment: Environment;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back';
  deployedBy: string;
  startedAt: string;
  completedAt: string | null;
  commitHash: string;
  message: string;
}

export interface ReleaseInfo {
  version: string;
  buildNumber: string;
  gitHash: string;
  buildDate: string;
  environment: Environment;
  changelog: ChangelogEntry[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: { type: 'added' | 'changed' | 'fixed' | 'removed'; description: string }[];
}

export interface BuildInfo {
  version: string;
  buildNumber: string;
  gitHash: string;
  buildDate: string;
  target: string;
  bundleSize: number;
  assetCount: number;
}

export interface DomainConfig {
  primary: string;
  aliases: string[];
  enforceHttps: boolean;
  enforceWwwRedirect: boolean;
  canonicalDomain: string;
}

export interface SslConfig {
  enabled: boolean;
  hstsEnabled: boolean;
  hstsMaxAge: number;
  secureCookies: boolean;
  mixedContentPrevention: boolean;
}

export interface ProductionChecklistItem {
  id: string;
  category: string;
  description: string;
  required: boolean;
  status: 'pass' | 'fail' | 'pending' | 'warning';
  message: string;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'index' | 'query' | 'rls' | 'storage' | 'config';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}
