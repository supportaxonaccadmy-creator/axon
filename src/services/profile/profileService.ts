import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { getAuthErrorMessage } from '@/lib/helpers/supabaseErrorFormatter';
import type {
  Profile,
  ProfileUpdate,
  ProfileResponse,
  ProfileUpdateResponse,
  AvatarUploadResponse,
} from '@/types/profile';

const TABLE = 'profiles';
const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface ProfileRow {
  id: string;
  auth_user_id: string;
  uuid: string;
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  avatar_url: string | null;
  role: 'admin' | 'student';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    uuid: row.uuid,
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile,
    avatarUrl: row.avatar_url,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ALLOWED_MIME_TYPES.some(
    (t) => t.endsWith(ext),
  )
    ? ext
    : 'jpg';
  return `${Date.now()}.${safeExt}`;
}

export async function getProfile(
  authUserId: string,
): Promise<ProfileResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    logger.error('getProfile error', { error: error.message });
    return { profile: null, error: getAuthErrorMessage(error) };
  }
  if (!data) {
    return { profile: null, error: 'Profile not found' };
  }
  return { profile: mapProfile(data as ProfileRow), error: null };
}

export async function getCurrentProfile(): Promise<ProfileResponse> {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { profile: null, error: 'Not authenticated' };
  }

  return getProfile(user.id);
}

export async function updateProfile(
  authUserId: string,
  updates: ProfileUpdate,
): Promise<ProfileUpdateResponse> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};
  if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
  if (updates.mobile !== undefined) updateData.mobile = updates.mobile;
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updateData)
    .eq('auth_user_id', authUserId)
    .select('*')
    .maybeSingle();

  if (error) {
    logger.error('updateProfile error', { error: error.message });
    return { profile: null, error: getAuthErrorMessage(error) };
  }
  if (!data) {
    return { profile: null, error: 'Profile not found' };
  }
  return { profile: mapProfile(data as ProfileRow), error: null };
}

export async function uploadAvatar(
  authUserId: string,
  file: File,
): Promise<AvatarUploadResponse> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { url: null, error: 'Only image files are allowed (JPEG, PNG, WebP, GIF)' };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { url: null, error: 'File size must not exceed 2MB' };
  }

  const supabase = getSupabaseClient();
  const safeName = sanitizeFilename(file.name);
  const path = `${authUserId}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    logger.error('uploadAvatar error', { error: uploadError.message });
    return { url: null, error: getAuthErrorMessage(uploadError) };
  }

  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, error: null };
}

export async function deleteAvatar(
  authUserId: string,
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { data: listData, error: listError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(authUserId);

  if (listError) {
    logger.error('deleteAvatar list error', { error: listError.message });
    return { error: getAuthErrorMessage(listError) };
  }

  if (!listData || listData.length === 0) {
    return { error: null };
  }

  const filesToRemove = listData.map((f) => `${authUserId}/${f.name}`);

  const { error: removeError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove(filesToRemove);

  if (removeError) {
    logger.error('deleteAvatar remove error', { error: removeError.message });
    return { error: getAuthErrorMessage(removeError) };
  }

  return { error: null };
}

export async function refreshProfile(): Promise<ProfileResponse> {
  return getCurrentProfile();
}
