import type { ReactNode } from 'react';
import { AppProvider } from './AppProvider';
import { ThemeProvider } from './ThemeProvider';
import { LoadingProvider } from './LoadingProvider';
import { SessionProvider } from './SessionProvider';
import { AuthProvider } from './AuthProvider';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ThemeProvider>
        <LoadingProvider>
          <SessionProvider>
            <AuthProvider>{children}</AuthProvider>
          </SessionProvider>
        </LoadingProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
