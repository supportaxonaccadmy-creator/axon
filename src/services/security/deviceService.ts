import type { DeviceSession } from './security.types';

class DeviceService {
  private listeners = new Set<(devices: DeviceSession[]) => void>();
  getDeviceInfo(): { deviceId: string; deviceName: string; deviceType: string; browser: string; os: string } {
    const deviceId = this.getDeviceId(); const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return { deviceId, deviceName: this.getDeviceName(ua), deviceType: this.getDeviceType(ua), browser: this.getBrowser(ua), os: this.getOS(ua) };
  }
  private getDeviceId(): string { if (typeof localStorage === 'undefined') return 'server'; let id = localStorage.getItem('lms_device_id'); if (!id) { id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`; localStorage.setItem('lms_device_id', id); } return id; }
  private getDeviceName(ua: string): string { if (/Mobile|Android|iPhone/.test(ua)) return 'Mobile Device'; if (/iPad|Tablet/.test(ua)) return 'Tablet'; return 'Desktop'; }
  private getDeviceType(ua: string): string { if (/Mobile|Android|iPhone/.test(ua)) return 'mobile'; if (/iPad|Tablet/.test(ua)) return 'tablet'; return 'desktop'; }
  private getBrowser(ua: string): string { if (/Edg/.test(ua)) return 'Edge'; if (/Chrome/.test(ua)) return 'Chrome'; if (/Firefox/.test(ua)) return 'Firefox'; if (/Safari/.test(ua)) return 'Safari'; return 'Unknown'; }
  private getOS(ua: string): string { if (/Windows/.test(ua)) return 'Windows'; if (/Mac OS/.test(ua)) return 'macOS'; if (/Android/.test(ua)) return 'Android'; if (/iOS|iPhone|iPad/.test(ua)) return 'iOS'; if (/Linux/.test(ua)) return 'Linux'; return 'Unknown'; }
  async registerDevice(userId: string): Promise<void> { try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const info = this.getDeviceInfo(); await supabase.from('user_device_sessions').upsert({ user_id: userId, device_id: info.deviceId, device_name: info.deviceName, device_type: info.deviceType, browser: info.browser, os: info.os, is_active: true, last_active_at: new Date().toISOString() }, { onConflict: 'user_id,device_id' }); } catch { /* ignore */ } }
  async getActiveSessions(userId: string): Promise<DeviceSession[]> { try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { data, error } = await supabase.from('user_device_sessions').select('*').eq('user_id', userId).eq('is_active', true).order('last_active_at', { ascending: false }); if (error || !data) return []; return data as unknown as DeviceSession[]; } catch { return []; } }
  async revokeSession(sessionId: string): Promise<boolean> { try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { error } = await supabase.from('user_device_sessions').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('id', sessionId); return !error; } catch { return false; } }
  async revokeAllSessions(userId: string, exceptDeviceId?: string): Promise<boolean> { try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); let query = supabase.from('user_device_sessions').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('user_id', userId).eq('is_active', true); if (exceptDeviceId) query = query.neq('device_id', exceptDeviceId); const { error } = await query; return !error; } catch { return false; } }
  async updateActivity(userId: string): Promise<void> { try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const info = this.getDeviceInfo(); await supabase.from('user_device_sessions').update({ last_active_at: new Date().toISOString() }).eq('user_id', userId).eq('device_id', info.deviceId); } catch { /* ignore */ } }
  subscribe(listener: (devices: DeviceSession[]) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
}

export const deviceService = new DeviceService();
