import { getSupabaseClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { realtimeConfig } from '@/config/realtime';
import { logger } from '@/lib/logger';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';

export interface RealtimeSubscriptionOptions {
  event: RealtimeEvent | '*';
  schema: string;
  table: string;
  filter?: string | undefined;
  callback: (payload: unknown) => void;
}

class ChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();

  subscribe(name: string, options: RealtimeSubscriptionOptions): RealtimeChannel {
    if (this.channels.has(name)) {
      logger.warn(`Channel "${name}" already exists, removing existing channel`);
      this.unsubscribe(name);
    }

    const client = getSupabaseClient();
    let channel = client.channel(name);

    const filterConfig: {
      event: string;
      schema: string;
      table: string;
      filter?: string | undefined;
    } = {
      event: options.event,
      schema: options.schema,
      table: options.table,
    };
    if (options.filter) {
      filterConfig.filter = options.filter;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel = (channel as any).on('postgres_changes', filterConfig, (payload: unknown) => {
      options.callback(payload);
    });

    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        this.reconnectAttempts.set(name, 0);
        logger.info(`Realtime channel "${name}" subscribed`);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        logger.error(`Realtime channel "${name}" error: ${status}`);
        this.handleReconnect(name, options);
      } else if (status === 'CLOSED') {
        logger.info(`Realtime channel "${name}" closed`);
      }
    });

    this.channels.set(name, channel);
    this.reconnectAttempts.set(name, 0);
    return channel;
  }

  unsubscribe(name: string): void {
    const channel = this.channels.get(name);
    if (!channel) return;

    getSupabaseClient().removeChannel(channel);
    this.channels.delete(name);
    this.reconnectAttempts.delete(name);
    logger.debug(`Realtime channel "${name}" unsubscribed`);
  }

  unsubscribeAll(): void {
    for (const name of this.channels.keys()) {
      this.unsubscribe(name);
    }
  }

  getChannel(name: string): RealtimeChannel | undefined {
    return this.channels.get(name);
  }

  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  private handleReconnect(name: string, options: RealtimeSubscriptionOptions): void {
    const attempts = this.reconnectAttempts.get(name) ?? 0;
    if (attempts >= realtimeConfig.maxReconnectAttempts) {
      logger.error(`Max reconnect attempts reached for channel "${name}"`);
      return;
    }

    this.reconnectAttempts.set(name, attempts + 1);
    const delay = realtimeConfig.reconnectDelayMs * (attempts + 1);

    logger.warn(`Reconnecting channel "${name}" (attempt ${attempts + 1}) in ${delay}ms`);

    setTimeout(() => {
      this.unsubscribe(name);
      this.subscribe(name, options);
    }, delay);
  }
}

export const channelManager = new ChannelManager();
export { ChannelManager };
