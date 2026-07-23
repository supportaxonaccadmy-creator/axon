import { environmentConfig } from './runtime';

export const envConfig = {
  isDev: environmentConfig.isDev,
  isProd: environmentConfig.isProd,
  isTest: environmentConfig.isTest,
  supabaseUrl: environmentConfig.supabaseUrl,
  supabaseAnonKey: environmentConfig.supabaseAnonKey,
};
