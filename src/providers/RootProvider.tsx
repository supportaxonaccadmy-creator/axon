import type { ReactNode } from 'react';
import { AppProvider } from './AppProvider';
import { ThemeProvider } from './ThemeProvider';
import { LoadingProvider } from './LoadingProvider';
import { SessionProvider } from './SessionProvider';
import { AuthProvider } from './AuthProvider';
import { ProfileProvider } from './ProfileProvider';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ThemeProvider>
        <LoadingProvider>
          <SessionProvider>
            <AuthProvider>
              <ProfileProvider>{children}</ProfileProvider>
            </AuthProvider>
          </SessionProvider>
        </LoadingProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
