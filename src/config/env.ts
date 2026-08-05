import { environmentConfig } from './runtime';

export const envConfig = {
  isDev: environmentConfig.isDev,
  isProd: environmentConfig.isProd,
  isTest: environmentConfig.isTest,
  supabaseUrl: environmentConfig.supabaseUrl,
  supabaseAnonKey: environmentConfig.supabaseAnonKey,
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID ?? '',
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? '',
  appUrl: import.meta.env.VITE_APP_URL ?? window.location.origin,
  successUrl: import.meta.env.VITE_SUCCESS_URL ?? '/student/payment/success',
  cancelUrl: import.meta.env.VITE_CANCEL_URL ?? '/student/payment/failure',
};
