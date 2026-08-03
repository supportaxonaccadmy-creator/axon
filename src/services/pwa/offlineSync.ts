import { offlineStorage } from './offlineStorage';
import type { OfflineQueueItem } from './pwa.types';

type SyncHandler = (item: OfflineQueueItem) => Promise<boolean>;

class OfflineSync {
  private handlers = new Map<string, SyncHandler>();
  private syncing = false;
  private listeners = new Set<(progress: { total: number; completed: number; failed: number }) => void>();

  registerHandler(type: string, handler: SyncHandler): void {
    this.handlers.set(type, handler);
  }

  enqueue(type: string, payload: Record<string, unknown>): OfflineQueueItem {
    return offlineStorage.addToQueue({ type, payload });
  }

  async sync(): Promise<{ total: number; completed: number; failed: number }> {
    if (this.syncing) return { total: 0, completed: 0, failed: 0 };
    this.syncing = true;
    const queue = offlineStorage.getQueue();
    let completed = 0;
    let failed = 0;
    for (const item of queue) {
      const handler = this.handlers.get(item.type);
      if (!handler) { failed++; continue; }
      try {
        const success = await handler(item);
        if (success) {
          offlineStorage.removeFromQueue(item.id);
          completed++;
        } else {
          offlineStorage.updateQueueItem(item.id, { retryCount: item.retryCount + 1 });
          failed++;
        }
      } catch {
        offlineStorage.updateQueueItem(item.id, { retryCount: item.retryCount + 1 });
        failed++;
      }
      this.notify({ total: queue.length, completed, failed });
    }
    this.syncing = false;
    return { total: queue.length, completed, failed };
  }

  subscribe(listener: (progress: { total: number; completed: number; failed: number }) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(progress: { total: number; completed: number; failed: number }): void {
    this.listeners.forEach((l) => l(progress));
  }

  get pendingCount(): number {
    return offlineStorage.getQueue().length;
  }

  get isSyncing(): boolean {
    return this.syncing;
  }
}

export const offlineSync = new OfflineSync();
