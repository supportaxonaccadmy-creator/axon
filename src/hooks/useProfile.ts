import { useProfileContext } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, ProfileRole } from '@/types/profile';

export function useProfile(): {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Parameters<ReturnType<typeof useProfileContext>['updateProfile']>[0]) => Promise<{ error: string | null }>;
} {
  const { profile, loading, refreshProfile, updateProfile } = useProfileContext();
  return { profile, loading, refreshProfile, updateProfile };
}

export function useCurrentUser(): Profile | null {
  const { profile } = useProfileContext();
  return profile;
}

export function useUserRole(): ProfileRole | null {
  const { profile } = useProfileContext();
  return profile?.role ?? null;
}

export function useIsAdmin(): boolean {
  const { profile } = useProfileContext();
  return profile?.role === 'admin';
}

export function useAvatar(): string | null {
  const { profile } = useProfileContext();
  return profile?.avatarUrl ?? null;
}

export function useProfileDisplayName(): string {
  const { profile } = useProfileContext();
  const { user } = useAuth();
  return profile?.fullName ?? user?.email?.split('@')[0] ?? 'User';
}
