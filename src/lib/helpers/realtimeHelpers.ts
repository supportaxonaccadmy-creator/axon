import { subscribe, unsubscribe, unsubscribeAll, getActiveChannels } from '@/lib/realtime';
import type { RealtimeEvent } from '@/lib/realtime';

export function subscribeToTable(
  name: string,
  table: string,
  callback: (payload: unknown) => void,
  options?: {
    event?: RealtimeEvent | '*' | undefined;
    filter?: string | undefined;
  },
) {
  return subscribe(name, table, callback, options);
}

export function unsubscribeChannel(name: string): void {
  unsubscribe(name);
}

export function unsubscribeAllChannels(): void {
  unsubscribeAll();
}

export function listActiveChannels(): string[] {
  return getActiveChannels();
}
