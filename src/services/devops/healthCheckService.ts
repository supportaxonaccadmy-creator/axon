import type { HealthCheckResult, HealthStatus } from './devops.types';

class HealthCheckService {
  async checkDatabase(): Promise<HealthCheckResult> {
    const start = performance.now();
    try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { error } = await supabase.from('profiles').select('id').limit(1).maybeSingle(); const responseTime = performance.now() - start; if (error) return { component: 'database', healthy: false, status: 'unhealthy', message: error.message, responseTime, timestamp: new Date().toISOString() }; return { component: 'database', healthy: true, status: 'healthy', message: 'Database connection successful', responseTime, timestamp: new Date().toISOString() }; } catch (err) { return { component: 'database', healthy: false, status: 'unhealthy', message: err instanceof Error ? err.message : 'Unknown error', responseTime: performance.now() - start, timestamp: new Date().toISOString() }; }
  }
  async checkApi(): Promise<HealthCheckResult> {
    const start = performance.now();
    try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { error } = await supabase.auth.getSession(); const responseTime = performance.now() - start; return { component: 'api', healthy: !error, status: !error ? 'healthy' : 'degraded', message: !error ? 'API reachable' : error.message, responseTime, timestamp: new Date().toISOString() }; } catch (err) { return { component: 'api', healthy: false, status: 'unhealthy', message: err instanceof Error ? err.message : 'Unknown error', responseTime: performance.now() - start, timestamp: new Date().toISOString() }; }
  }
  async checkStorage(): Promise<HealthCheckResult> {
    const start = performance.now();
    try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { data, error } = await supabase.storage.listBuckets(); const responseTime = performance.now() - start; if (error) return { component: 'storage', healthy: false, status: 'unhealthy', message: error.message, responseTime, timestamp: new Date().toISOString() }; return { component: 'storage', healthy: true, status: 'healthy', message: `${data?.length ?? 0} storage buckets available`, responseTime, timestamp: new Date().toISOString() }; } catch (err) { return { component: 'storage', healthy: false, status: 'unhealthy', message: err instanceof Error ? err.message : 'Unknown error', responseTime: performance.now() - start, timestamp: new Date().toISOString() }; }
  }
  async checkAuthentication(): Promise<HealthCheckResult> {
    const start = performance.now();
    try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { data, error } = await supabase.auth.getSession(); const responseTime = performance.now() - start; if (error) return { component: 'auth', healthy: false, status: 'unhealthy', message: error.message, responseTime, timestamp: new Date().toISOString() }; return { component: 'auth', healthy: true, status: 'healthy', message: data.session ? 'User session active' : 'No active session (OK)', responseTime, timestamp: new Date().toISOString() }; } catch (err) { return { component: 'auth', healthy: false, status: 'unhealthy', message: err instanceof Error ? err.message : 'Unknown error', responseTime: performance.now() - start, timestamp: new Date().toISOString() }; }
  }
  checkEnvironment(): HealthCheckResult {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; const issues: string[] = []; if (!supabaseUrl) issues.push('VITE_SUPABASE_URL missing'); if (!supabaseAnonKey) issues.push('VITE_SUPABASE_ANON_KEY missing'); return { component: 'environment', healthy: issues.length === 0, status: issues.length === 0 ? 'healthy' : 'unhealthy', message: issues.length === 0 ? 'All environment variables configured' : issues.join('; '), responseTime: 0, timestamp: new Date().toISOString() };
  }
  checkBuild(): HealthCheckResult { const isProd = import.meta.env.PROD; return { component: 'build', healthy: true, status: 'healthy', message: isProd ? 'Production build' : 'Development build', responseTime: 0, timestamp: new Date().toISOString() }; }
  async runAllHealthChecks(): Promise<HealthCheckResult[]> { const [db, api, storage, auth] = await Promise.all([this.checkDatabase(), this.checkApi(), this.checkStorage(), this.checkAuthentication()]); return [this.checkEnvironment(), this.checkBuild(), db, api, storage, auth]; }
  async getOverallHealth(): Promise<HealthStatus> { const checks = await this.runAllHealthChecks(); const allHealthy = checks.every((c) => c.healthy); const anyUnhealthy = checks.some((c) => c.status === 'unhealthy'); return { healthy: allHealthy, status: allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded', message: `${checks.filter((c) => c.healthy).length}/${checks.length} checks passed`, timestamp: new Date().toISOString() }; }
}

export const healthCheckService = new HealthCheckService();
