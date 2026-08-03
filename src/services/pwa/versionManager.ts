import type { VersionInfo } from './pwa.types';

class VersionManager {
  private currentVersion: VersionInfo = {
    version: '5.3.0',
    buildNumber: '1',
    buildDate: new Date().toISOString(),
    gitHash: '',
  };

  private listeners = new Set<(updateAvailable: boolean) => void>();
  private updateAvailable = false;

  getVersion(): VersionInfo {
    return this.currentVersion;
  }

  setVersion(info: Partial<VersionInfo>): void {
    this.currentVersion = { ...this.currentVersion, ...info };
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  setUpdateAvailable(available: boolean): void {
    this.updateAvailable = available;
    this.notify(available);
  }

  subscribe(listener: (updateAvailable: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(updateAvailable: boolean): void {
    this.listeners.forEach((l) => l(updateAvailable));
  }

  async checkForUpdates(): Promise<boolean> {
    try {
      const response = await fetch('/version.json', { cache: 'no-cache' });
      if (!response.ok) return false;
      const remote = await response.json() as VersionInfo;
      const hasUpdate = remote.version !== this.currentVersion.version;
      this.setUpdateAvailable(hasUpdate);
      return hasUpdate;
    } catch {
      return false;
    }
  }
}

export const versionManager = new VersionManager();
