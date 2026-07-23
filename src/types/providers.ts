export interface ProviderState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AppContextValue {
  isReady: boolean;
  isInitializing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  reset: () => void;
}

export interface ThemeContextValue {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface LoadingContextValue {
  isLoading: boolean;
  loadingMessage: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

export interface SessionContextValue {
  sessionId: string;
  startTime: number;
  isActive: boolean;
  lastActivity: number;
  updateActivity: () => void;
  resetSession: () => void;
}
