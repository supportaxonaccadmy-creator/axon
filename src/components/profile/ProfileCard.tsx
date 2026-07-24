import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import type { Profile } from '@/types/profile';

export interface ProfileCardProps {
  profile: Profile;
  onEdit?: () => void;
}

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const initials = (profile.fullName ?? profile.email ?? '?')
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar
            src={profile.avatarUrl ?? undefined}
            alt={profile.fullName ?? profile.email ?? 'User'}
            fallback={initials}
            size="xl"
            className="ring-4 ring-primary-100"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {profile.fullName ?? 'Unnamed User'}
                </h2>
                <p className="text-sm text-neutral-500">{profile.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={profile.role === 'admin' ? 'primary' : 'default'}>
                  {profile.role === 'admin' ? 'Administrator' : 'Student'}
                </Badge>
                <Badge variant={profile.isActive ? 'success' : 'error'}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <dl className="mt-6 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <dt className="text-sm font-medium text-neutral-500">Phone</dt>
                <dd className="text-sm text-neutral-900">{profile.mobile ?? 'Not provided'}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <dt className="text-sm font-medium text-neutral-500">User ID</dt>
                <dd className="text-sm text-neutral-900 font-mono">{profile.uuid.slice(0, 8)}...</dd>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <dt className="text-sm font-medium text-neutral-500">Member Since</dt>
                <dd className="text-sm text-neutral-900">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
