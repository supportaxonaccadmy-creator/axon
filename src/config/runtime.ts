import type { EnvironmentConfig, RuntimeConfig, FeatureFlags, VersionConfig, BuildConfig, AppConfig } from '@/types/configuration';

export const environmentConfig: EnvironmentConfig = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isTest: false,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  appName: 'Enterprise Nursing LMS',
  appUrl: typeof window !== 'undefined' ? window.location.origin : '',
};

export const runtimeConfig: RuntimeConfig = {
  apiBaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  apiTimeout: 30000,
  apiRetries: 3,
  logLevel: environmentConfig.isDev ? 'debug' : 'error',
  enableAnalytics: !environmentConfig.isDev,
  enableErrorReporting: !environmentConfig.isDev,
};

export const featureFlags: FeatureFlags = {
  enableDarkMode: true,
  enableNotifications: false,
  enableAnalytics: false,
  enableErrorReporting: false,
  enableDevTools: environmentConfig.isDev,
};

export const versionConfig: VersionConfig = {
  version: '0.0.0',
  buildNumber: '1',
  gitHash: '',
  buildDate: new Date().toISOString(),
};

export const buildConfig: BuildConfig = {
  target: environmentConfig.isProd ? 'production' : 'development',
  publicPath: '/',
  assetsDir: 'assets',
};

export const appConfig: AppConfig = {
  environment: environmentConfig,
  runtime: runtimeConfig,
  features: featureFlags,
  version: versionConfig,
  build: buildConfig,
};
