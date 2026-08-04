import type { Environment, EnvironmentInfo } from './devops.types';

class EnvironmentService {
  private getCurrentEnvironment(): Environment {
    if (import.meta.env.PROD) return 'production';
    if (import.meta.env.MODE === 'staging') return 'staging';
    return 'development';
  }

  getEnvironmentInfo(): EnvironmentInfo {
    const env = this.getCurrentEnvironment();
    const apiUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return { name: env, isProduction: env === 'production', isStaging: env === 'staging', isDevelopment: env === 'development', apiUrl, appUrl, logLevel: env === 'development' ? 'debug' : 'error', enableAnalytics: env === 'production', enableErrorReporting: env === 'production', enableDevTools: env === 'development' };
  }

  validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const env = this.getCurrentEnvironment();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl) errors.push('VITE_SUPABASE_URL is not set');
    else if (!supabaseUrl.startsWith('https://')) warnings.push('VITE_SUPABASE_URL should use HTTPS in production');
    if (!supabaseAnonKey) errors.push('VITE_SUPABASE_ANON_KEY is not set');
    if (env === 'production') { if (supabaseUrl && supabaseUrl.includes('localhost')) warnings.push('Supabase URL points to localhost in production'); }
    return { valid: errors.length === 0, errors, warnings };
  }

  isProduction(): boolean { return this.getCurrentEnvironment() === 'production'; }
  isStaging(): boolean { return this.getCurrentEnvironment() === 'staging'; }
  isDevelopment(): boolean { return this.getCurrentEnvironment() === 'development'; }
  getEnvironmentName(): Environment { return this.getCurrentEnvironment(); }
  getFeatureFlags(): Record<string, boolean> { return { enableDarkMode: true, enableNotifications: !this.isDevelopment(), enableAnalytics: this.isProduction(), enableErrorReporting: this.isProduction(), enableDevTools: this.isDevelopment() }; }
}

export const environmentService = new EnvironmentService();
