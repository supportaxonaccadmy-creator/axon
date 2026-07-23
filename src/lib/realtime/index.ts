import { channelManager } from './channelManager';
import type { RealtimeSubscriptionOptions, RealtimeEvent } from './channelManager';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function subscribe(
  name: string,
  table: string,
  callback: (payload: unknown) => void,
  options?: {
    event?: RealtimeEvent | '*' | undefined;
    schema?: string | undefined;
    filter?: string | undefined;
  },
): RealtimeChannel {
  return channelManager.subscribe(name, {
    event: options?.event ?? '*',
    schema: options?.schema ?? 'public',
    table,
    filter: options?.filter,
    callback,
  });
}

export function unsubscribe(name: string): void {
  channelManager.unsubscribe(name);
}

export function unsubscribeAll(): void {
  channelManager.unsubscribeAll();
}

export function getActiveChannels(): string[] {
  return channelManager.getActiveChannels();
}

export type { RealtimeSubscriptionOptions, RealtimeEvent };
export { channelManager, ChannelManager } from './channelManager';
