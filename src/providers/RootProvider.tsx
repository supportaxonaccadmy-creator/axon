import type { ReactNode } from 'react';
import { AppProvider } from './AppProvider';
import { ThemeProvider } from './ThemeProvider';
import { LoadingProvider } from './LoadingProvider';
import { SessionProvider } from './SessionProvider';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ThemeProvider>
        <LoadingProvider>
          <SessionProvider>{children}</SessionProvider>
        </LoadingProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
