import { offlineSync } from './offlineSync';
import { networkService } from './networkService';
import type { SyncProgress } from './pwa.types';

class BackgroundSyncManager {
  private registered = false;

  private listeners = new Set<(progress: SyncProgress) => void>();

  registerSyncHandlers(): void {
    if (this.registered) return;
    this.registered = true;

    offlineSync.registerHandler('video_progress', async (item) => {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('video_progress').upsert(item.payload);
      return !error;
    });

    offlineSync.registerHandler('study_progress', async (item) => {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('student_learning_analytics').upsert(item.payload);
      return !error;
    });

    offlineSync.registerHandler('attendance', async (item) => {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_attendance').upsert(item.payload);
      return !error;
    });

    offlineSync.registerHandler('analytics', async (item) => {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('engagement_metrics').upsert(item.payload);
      return !error;
    });

    offlineSync.registerHandler('notification_read', async (item) => {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', item.payload.id as string);
      return !error;
    });
  }

  async sync(): Promise<SyncProgress> {
    const result = await offlineSync.sync();
    const progress: SyncProgress = {
      total: result.total,
      completed: result.completed,
      failed: result.failed,
      current: null,
      percentage: result.total > 0 ? (result.completed / result.total) * 100 : 100,
    };
    this.notify(progress);
    return progress;
  }

  enqueue(type: string, payload: Record<string, unknown>): void {
    offlineSync.enqueue(type, payload);
  }

  get pendingCount(): number {
    return offlineSync.pendingCount;
  }

  subscribe(listener: (progress: SyncProgress) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(progress: SyncProgress): void {
    this.listeners.forEach((l) => l(progress));
  }

  init(): void {
    this.registerSyncHandlers();
    networkService.subscribe((state) => {
      if (state.online && offlineSync.pendingCount > 0) this.sync();
    });
  }
}

export const backgroundSync = new BackgroundSyncManager();
