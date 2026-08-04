const SECURE_STORAGE_PREFIX = 'lms_secure_';
const ENCRYPTION_KEY = 'lms_encryption_key';

class SecureStorageService {
  private key: string | null = null;
  private getKey(): string {
    if (this.key) return this.key;
    let stored = sessionStorage.getItem(ENCRYPTION_KEY);
    if (!stored) { stored = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, '0')).join(''); sessionStorage.setItem(ENCRYPTION_KEY, stored); }
    this.key = stored; return stored;
  }
  private async encrypt(data: string): Promise<string> {
    try { const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(this.getKey()), { name: 'AES-GCM' }, false, ['encrypt']); const iv = crypto.getRandomValues(new Uint8Array(12)); const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(data)); const combined = new Uint8Array(iv.length + encrypted.byteLength); combined.set(iv, 0); combined.set(new Uint8Array(encrypted), iv.length); return btoa(String.fromCharCode(...combined)); } catch { return data; }
  }
  private async decrypt(data: string): Promise<string> {
    try { const combined = Uint8Array.from(atob(data), (c) => c.charCodeAt(0)); const iv = combined.slice(0, 12); const encrypted = combined.slice(12); const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(this.getKey()), { name: 'AES-GCM' }, false, ['decrypt']); const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted); return new TextDecoder().decode(decrypted); } catch { return data; }
  }
  async set(key: string, value: unknown): Promise<void> { const fullKey = SECURE_STORAGE_PREFIX + key; const json = JSON.stringify(value); const encrypted = await this.encrypt(json); try { localStorage.setItem(fullKey, encrypted); } catch { /* ignore */ } }
  async get<T>(key: string): Promise<T | null> { const fullKey = SECURE_STORAGE_PREFIX + key; try { const stored = localStorage.getItem(fullKey); if (!stored) return null; const decrypted = await this.decrypt(stored); return JSON.parse(decrypted) as T; } catch { return null; } }
  remove(key: string): void { const fullKey = SECURE_STORAGE_PREFIX + key; try { localStorage.removeItem(fullKey); } catch { /* ignore */ } }
  clear(): void { try { Object.keys(localStorage).forEach((key) => { if (key.startsWith(SECURE_STORAGE_PREFIX)) localStorage.removeItem(key); }); } catch { /* ignore */ } }
}

export const secureStorage = new SecureStorageService();
