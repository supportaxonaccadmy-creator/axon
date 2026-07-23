import { BaseService } from '../base/BaseService';
import { STORAGE_KEYS } from '@/constants/storage';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage';

export class StorageService extends BaseService {
  get<T>(key: string, fallback: T): T {
    return getStorageItem(key, fallback);
  }

  set<T>(key: string, value: T): void {
    setStorageItem(key, value);
  }

  remove(key: string): void {
    removeStorageItem(key);
  }

  getTheme(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME);
    } catch {
      return null;
    }
  }

  setTheme(theme: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }

  getSession<T>(fallback: T): T {
    return this.get(STORAGE_KEYS.SESSION, fallback);
  }

  setSession<T>(value: T): void {
    this.set(STORAGE_KEYS.SESSION, value);
  }

  clearSession(): void {
    this.remove(STORAGE_KEYS.SESSION);
  }
}

export const storageService = new StorageService();
