export interface EnvironmentConfig {
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  appName: string;
  appUrl: string;
}

export interface RuntimeConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  apiRetries: number;
  logLevel: LogLevel;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

export interface FeatureFlags {
  enableDarkMode: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  enableDevTools: boolean;
}

export interface VersionConfig {
  version: string;
  buildNumber: string;
  gitHash: string;
  buildDate: string;
}

export interface BuildConfig {
  target: 'production' | 'development' | 'test';
  publicPath: string;
  assetsDir: string;
}

export interface AppConfig {
  environment: EnvironmentConfig;
  runtime: RuntimeConfig;
  features: FeatureFlags;
  version: VersionConfig;
  build: BuildConfig;
}
