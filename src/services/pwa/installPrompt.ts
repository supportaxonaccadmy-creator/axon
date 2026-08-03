import type { InstallPromptEvent } from './pwa.types';

class InstallPromptManager {
  private deferredPrompt: InstallPromptEvent | null = null;
  private listeners = new Set<(canInstall: boolean) => void>();

  init(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as unknown as InstallPromptEvent;
      this.notify(true);
    });
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notify(false);
    });
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    await this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.notify(false);
    return choice.outcome === 'accepted';
  }

  subscribe(listener: (canInstall: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(canInstall: boolean): void {
    this.listeners.forEach((l) => l(canInstall));
  }
}

export const installPrompt = new InstallPromptManager();
