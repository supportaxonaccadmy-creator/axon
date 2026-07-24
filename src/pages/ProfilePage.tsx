import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/providers/ToastProvider';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { uploadAvatar, deleteAvatar } from '@/services/profile';
import type { ProfileUpdate } from '@/types/profile';

export function ProfilePage() {
  const { profile, loading, refreshProfile, updateProfile } = useProfile();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function handleSubmit(updates: ProfileUpdate) {
    setFormError(null);
    setSubmitting(true);
    const { error } = await updateProfile(updates);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      toast.error('Update failed', error);
    } else {
      toast.success('Profile updated', 'Your changes have been saved.');
      setIsEditing(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!profile) return;
    setAvatarError(null);
    setAvatarLoading(true);
    const { url, error } = await uploadAvatar(profile.authUserId, file);
    if (error || !url) {
      setAvatarError(error ?? 'Upload failed');
      toast.error('Avatar upload failed', error ?? undefined);
    } else {
      await updateProfile({ avatarUrl: url });
      toast.success('Avatar updated');
    }
    setAvatarLoading(false);
  }

  async function handleAvatarRemove() {
    if (!profile) return;
    setAvatarError(null);
    setAvatarLoading(true);
    const { error: removeError } = await deleteAvatar(profile.authUserId);
    if (removeError) {
      setAvatarError(removeError);
      toast.error('Failed to remove avatar', removeError);
    } else {
      await updateProfile({ avatarUrl: null });
      toast.success('Avatar removed');
    }
    setAvatarLoading(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Alert variant="error" title="Profile not found">
          We couldn&apos;t load your profile. This may happen if your account was just created and the
          profile is still being set up.
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => refreshProfile()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <ProfileForm
          profile={profile}
          onSubmit={handleSubmit}
          onAvatarUpload={handleAvatarUpload}
          onAvatarRemove={handleAvatarRemove}
          avatarLoading={avatarLoading}
          avatarError={avatarError}
          submitting={submitting}
          formError={formError}
        />
      ) : (
        <ProfileCard profile={profile} onEdit={() => setIsEditing(true)} />
      )}

      {isEditing && (
        <div className="mt-4 flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              setFormError(null);
              setAvatarError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
