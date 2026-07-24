export type ProfileRole = 'admin' | 'student';

export type ProfileStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  authUserId: string;
  uuid: string;
  fullName: string | null;
  email: string | null;
  mobile: string | null;
  avatarUrl: string | null;
  role: ProfileRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdate {
  fullName?: string | null | undefined;
  mobile?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  isActive?: boolean | undefined;
}

export interface ProfileInsert {
  authUserId: string;
  uuid?: string | undefined;
  fullName?: string | null | undefined;
  email?: string | null | undefined;
  mobile?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  role?: ProfileRole | undefined;
  isActive?: boolean | undefined;
}

export interface ProfileResponse {
  profile: Profile | null;
  error: string | null;
}

export interface ProfileUpdateResponse {
  profile: Profile | null;
  error: string | null;
}

export interface AvatarUploadResponse {
  url: string | null;
  error: string | null;
}
