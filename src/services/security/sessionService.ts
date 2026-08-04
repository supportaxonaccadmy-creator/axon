import { securityService } from './securityService';
import type { SessionInfo } from './security.types';

const SESSION_TIMEOUT = 30 * 60 * 1000;
const ACTIVITY_CHECK_INTERVAL = 60 * 1000;
const STORAGE_KEY = 'lms_session_info';

class SessionService {
  private sessionInfo: SessionInfo | null = null;
  private listeners = new Set<(expired: boolean) => void>();
  private activityTimer: ReturnType<typeof setInterval> | null = null;
  private lastActivity: number = Date.now();

  init(): void {
    this.loadSession();
    this.startActivityTracking();
  }

  private loadSession(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) this.sessionInfo = JSON.parse(stored);
    } catch { /* ignore */ }
  }

  private saveSession(): void {
    if (this.sessionInfo) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessionInfo)); } catch { /* ignore */ }
    }
  }

  setSession(userId: string): void {
    const deviceId = securityService.generateDeviceId();
    this.sessionInfo = {
      userId,
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      deviceId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT,
      lastActivity: Date.now(),
    };
    this.lastActivity = Date.now();
    this.saveSession();
  }

  getSession(): SessionInfo | null {
    return this.sessionInfo;
  }

  isExpired(): boolean {
    if (!this.sessionInfo) return true;
    return Date.now() > this.sessionInfo.expiresAt || Date.now() - this.lastActivity > SESSION_TIMEOUT;
  }

  getTimeUntilExpiry(): number {
    if (!this.sessionInfo) return 0;
    return Math.max(0, this.sessionInfo.expiresAt - Date.now());
  }

  refresh(): void {
    if (this.sessionInfo) {
      this.sessionInfo.expiresAt = Date.now() + SESSION_TIMEOUT;
      this.sessionInfo.lastActivity = Date.now();
      this.lastActivity = Date.now();
      this.saveSession();
    }
  }

  clear(): void {
    this.sessionInfo = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  private startActivityTracking(): void {
    if (typeof window === 'undefined') return;
    const updateActivity = () => { this.lastActivity = Date.now(); if (this.sessionInfo) this.sessionInfo.lastActivity = this.lastActivity; };
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('scroll', updateActivity);
    this.activityTimer = setInterval(() => {
      if (this.isExpired()) { this.notify(true); this.clear(); }
    }, ACTIVITY_CHECK_INTERVAL);
  }

  subscribe(listener: (expired: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(expired: boolean): void {
    this.listeners.forEach((l) => l(expired));
  }

  destroy(): void {
    if (this.activityTimer) clearInterval(this.activityTimer);
  }
}

export const sessionService = new SessionService();
