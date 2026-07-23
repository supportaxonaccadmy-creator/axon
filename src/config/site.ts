import { APP_CONFIG } from '@/constants/app';

export const siteConfig = {
  name: APP_CONFIG.name,
  shortName: APP_CONFIG.shortName,
  description: APP_CONFIG.description,
  locale: APP_CONFIG.locale,
};

export { envConfig } from './env';
export { appConfig, environmentConfig, runtimeConfig, featureFlags, versionConfig, buildConfig } from './runtime';
