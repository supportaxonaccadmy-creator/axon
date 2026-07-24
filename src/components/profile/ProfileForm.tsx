import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import type { Profile, ProfileUpdate } from '@/types/profile';

export interface ProfileFormProps {
  profile: Profile;
  onSubmit: (updates: ProfileUpdate) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  avatarLoading?: boolean | undefined;
  avatarError?: string | null | undefined;
  submitting?: boolean | undefined;
  formError?: string | null | undefined;
}

export function ProfileForm({
  profile,
  onSubmit,
  onAvatarUpload,
  onAvatarRemove,
  avatarLoading = false,
  avatarError,
  submitting = false,
  formError,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.fullName ?? '');
  const [mobile, setMobile] = useState(profile.mobile ?? '');
  const [errors, setErrors] = useState<{ fullName?: string; mobile?: string }>({});

  useEffect(() => {
    setFullName(profile.fullName ?? '');
    setMobile(profile.mobile ?? '');
  }, [profile]);

  function validate(): boolean {
    const next: { fullName?: string; mobile?: string } = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (mobile && mobile.length < 7) next.mobile = 'Phone number seems too short';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ fullName: fullName.trim(), mobile: mobile.trim() || null });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex justify-center">
        <AvatarUploader
          currentUrl={profile.avatarUrl}
          fullName={profile.fullName}
          onUpload={onAvatarUpload}
          onRemove={onAvatarRemove}
          loading={avatarLoading}
          error={avatarError}
        />
      </div>

      {formError && (
        <Alert variant="error">{formError}</Alert>
      )}

      <Input
        label="Full Name"
        type="text"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        placeholder="Enter your full name"
        required
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={profile.email ?? ''}
        disabled
        hint="Email cannot be changed"
      />

      <Input
        label="Phone Number"
        type="tel"
        name="mobile"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        error={errors.mobile}
        placeholder="Enter your phone number"
      />

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={submitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
