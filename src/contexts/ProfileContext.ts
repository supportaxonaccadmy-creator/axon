import { createContext, useContext } from 'react';
import type { Profile, ProfileUpdate } from '@/types/profile';

export interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: string | null }>;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return ctx;
}
