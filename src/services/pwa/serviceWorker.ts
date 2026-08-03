class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private listeners = new Set<(updateAvailable: boolean) => void>();

  async register(): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notify(true);
            }
          });
        }
      });
    } catch { /* SW registration failed */ }
  }

  async update(): Promise<void> {
    if (!this.registration) return;
    await this.registration.update();
  }

  async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) return;
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  async unregister(): Promise<void> {
    if (!this.registration) return;
    await this.registration.unregister();
    this.registration = null;
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  subscribe(listener: (updateAvailable: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(updateAvailable: boolean): void {
    this.listeners.forEach((l) => l(updateAvailable));
  }

  getCacheNames(): string[] {
    if (typeof caches === 'undefined') return [];
    return ['api-cache', 'storage-cache', 'static-resources', 'image-cache', 'workbox-precache-v2-https://localhost:5173/'];
  }

  async clearCache(cacheName?: string): Promise<void> {
    if (typeof caches === 'undefined') return;
    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  }

  async getCacheSize(): Promise<number> {
    if (typeof caches === 'undefined' || !this.registration) return 0;
    const keys = await caches.keys();
    let size = 0;
    for (const key of keys) {
      const cache = await caches.open(key);
      const requests = await cache.keys();
      size += requests.length;
    }
    return size;
  }
}

export const serviceWorker = new ServiceWorkerManager();
