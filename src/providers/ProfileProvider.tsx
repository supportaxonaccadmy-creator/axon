import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ProfileContext, type ProfileContextValue } from '@/contexts/ProfileContext';
import { getCurrentProfile, updateProfile as updateProfileService } from '@/services/profile';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, ProfileUpdate } from '@/types/profile';
import { logger } from '@/lib/logger';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, authenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUserId: string) => {
    setLoading(true);
    const { profile: loadedProfile, error } = await getCurrentProfile();
    if (error) {
      logger.warn('Profile load failed', { error, authUserId });
    }
    if (loadedProfile) {
      setProfile(loadedProfile);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated && user) {
      loadProfile(user.id);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [authenticated, user, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<{ error: string | null }> => {
      if (!user) return { error: 'Not authenticated' };
      const { profile: updated, error } = await updateProfileService(user.id, updates);
      if (error) return { error };
      if (updated) setProfile(updated);
      return { error: null };
    },
    [user],
  );

  const value: ProfileContextValue = {
    profile,
    loading,
    refreshProfile,
    updateProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
