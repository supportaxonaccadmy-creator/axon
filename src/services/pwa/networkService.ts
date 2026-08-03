import type { NetworkState, ConnectionType } from './pwa.types';

class NetworkService {
  private listeners = new Set<(state: NetworkState) => void>();
  private currentState: NetworkState = { online: typeof navigator !== 'undefined' ? navigator.onLine : true, effectiveType: undefined, downlink: undefined, rtt: undefined };

  init(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => this.updateState(true));
    window.addEventListener('offline', () => this.updateState(false));
    this.updateConnectionInfo();
  }

  private updateConnectionInfo(): void {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) return;
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; addEventListener: (t: string, cb: () => void) => void } }).connection;
    if (!conn) return;
    this.currentState = { ...this.currentState, effectiveType: conn.effectiveType, downlink: conn.downlink, rtt: conn.rtt };
    conn.addEventListener('change', () => {
      this.currentState = { ...this.currentState, effectiveType: conn.effectiveType, downlink: conn.downlink, rtt: conn.rtt };
      this.notify();
    });
  }

  private updateState(online: boolean): void {
    this.currentState = { ...this.currentState, online };
    this.notify();
  }

  getState(): NetworkState {
    return this.currentState;
  }

  isOnline(): boolean {
    return this.currentState.online;
  }

  isSlowConnection(): boolean {
    const type = this.currentState.effectiveType as ConnectionType | undefined;
    return type === 'slow-2g' || type === '2g';
  }

  getConnectionType(): ConnectionType {
    return (this.currentState.effectiveType as ConnectionType) ?? 'unknown';
  }

  subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.currentState));
  }
}

export const networkService = new NetworkService();
