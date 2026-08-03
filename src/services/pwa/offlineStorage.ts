import type { OfflineQueueItem } from './pwa.types';

const QUEUE_KEY = 'lms_offline_queue';
const STORAGE_KEY = 'lms_offline_data_';

class OfflineStorage {
  getQueue(): OfflineQueueItem[] {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  addToQueue(item: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'retryCount'>): OfflineQueueItem {
    const queue = this.getQueue();
    const newItem: OfflineQueueItem = {
      ...item,
      id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      retryCount: 0,
    };
    queue.push(newItem);
    this.saveQueue(queue);
    return newItem;
  }

  removeFromQueue(id: string): void {
    const queue = this.getQueue().filter((item) => item.id !== id);
    this.saveQueue(queue);
  }

  updateQueueItem(id: string, updates: Partial<OfflineQueueItem>): void {
    const queue = this.getQueue().map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.saveQueue(queue);
  }

  clearQueue(): void {
    this.saveQueue([]);
  }

  private saveQueue(queue: OfflineQueueItem[]): void {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch { /* ignore */ }
  }

  saveData<T>(key: string, data: T): void {
    try { localStorage.setItem(STORAGE_KEY + key, JSON.stringify({ data, timestamp: Date.now() })); } catch { /* ignore */ }
  }

  getData<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + key);
      if (!stored) return null;
      return JSON.parse(stored).data;
    } catch { return null; }
  }

  removeData(key: string): void {
    try { localStorage.removeItem(STORAGE_KEY + key); } catch { /* ignore */ }
  }

  getOfflineKeys(): string[] {
    return Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_KEY)).map((k) => k.replace(STORAGE_KEY, ''));
  }

  getStorageSize(): number {
    let size = 0;
    for (const key of this.getOfflineKeys()) {
      const val = localStorage.getItem(STORAGE_KEY + key);
      if (val) size += val.length;
    }
    return size;
  }
}

export const offlineStorage = new OfflineStorage();
